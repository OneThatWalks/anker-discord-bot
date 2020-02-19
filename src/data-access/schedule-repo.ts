import { readFile, writeFile } from 'fs';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
import { google } from 'googleapis';
import { inject, injectable } from "tsyringe";
import { AppConfig, GoogleApisConfig } from '../models/app-config';
import { Employee, IScheduleRepo, Schedule, ScheduleDay } from '../types';
import ScheduleImpl from '../models/schedule';
import ScheduleDayImpl from '../models/schedule-day';

@injectable()
class ScheduleRepo implements IScheduleRepo {

    // TODO:: Move google api "client" out of this class or rename and keep ctor

    private googleApisConfig: GoogleApisConfig;
    private scope = 'https://www.googleapis.com/auth/calendar';
    private tokenPath = './tokens.json';
    private oAuth2Client: OAuth2Client;
    private refreshToken: string;

    /**
     * Initializes the schedule repo
     */
    constructor(@inject(AppConfig) private appConfig: AppConfig) {
        this.googleApisConfig = appConfig.googleapis;
    }

    async getSchedules(employees: Employee[]): Promise<Schedule[]> {
        const calendar = google.calendar({ version: 'v3', auth: this.getClient() });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);

        try {
            const results = await calendar.events.list({
                calendarId: this.googleApisConfig.calendar.calendarId,
                timeMin: startDate.toISOString(),
                timeMax: endDate.toISOString()
            });

            const schedules: Schedule[] = [];

            for (const event of results.data.items) {
                // Read each event and construct schedule

                for (const employee of employees) {
                    // Iterate and check employees schedules

                    const schedule = new ScheduleImpl();
                    schedule.employee = employee;
                    schedule.days = [];

                    if (event.attendees.findIndex(attendee => employee.Email === attendee.email) > -1) {
                        const day: ScheduleDay = new ScheduleDayImpl();
                        day.start = new Date(event.start.dateTime)
                        day.end = new Date(event.end.dateTime);

                        schedule.days.push(day);
                    }

                    if (schedule.days.length > 0) {
                        schedules.push(schedule);
                    }
                }
            }

            return schedules;

        } catch (err) {
            console.error(err);
            throw err;
        }

        // REMARKS: Calendar id can be found in calendar sharing settings
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getSchedule(employee: Employee): Promise<Schedule> {
        const calendar = google.calendar({ version: 'v3', auth: this.getClient() });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);

        try {
            const results = await calendar.events.list({
                calendarId: this.googleApisConfig.calendar.calendarId,
                timeMin: startDate.toISOString(),
                timeMax: endDate.toISOString()
            });

            const schedule = new ScheduleImpl();
            schedule.employee = employee;
            schedule.days = [];

            for (const event of results.data.items) {
                // Read each event and construct schedule
                if (event.attendees.findIndex(attendee => employee.Email === attendee.email) > -1) {
                    const day: ScheduleDay = new ScheduleDayImpl();
                    day.start = new Date(event.start.dateTime)
                    day.end = new Date(event.end.dateTime);

                    schedule.days.push(day);
                }
            }

            return schedule;

        } catch (err) {
            console.error(err);
            throw err;
        }

        // REMARKS: Calendar id can be found in calendar sharing settings
        return null;
    }

    authorize(): Promise<void>;
    authorize(code: string): Promise<void>;
    async authorize(code?: string): Promise<void> {
        const oAuth2Client = this.getClient();

        try {
            const tokens = await this.checkForTokens();
            if (tokens) {
                oAuth2Client.setCredentials(tokens);
                console.log('Authenticated');
                return;
            }
        } catch (err) {
            console.log('There was an issue getting tokens from file');
        }


        if (!code) {
            const authUrl = oAuth2Client.generateAuthUrl({
                // eslint-disable-next-line @typescript-eslint/camelcase
                access_type: 'offline',
                scope: this.scope
            });
            console.log(`Please visit ${authUrl} to authorize this app.  Then message the bot with !authCode {code} without curly braces`);
            return;
        }

        oAuth2Client.getToken(code).then(async (value: GetTokenResponse) => {
            const { tokens } = value;
            oAuth2Client.setCredentials(tokens);
            await this.saveTokens(tokens);
            console.log('Authenticated');
        });
    }

    private saveTokens(tokens: Credentials): Promise<void> {
        return new Promise((res, rej) => {
            writeFile(this.tokenPath, JSON.stringify(tokens), { encoding: 'UTF-8' }, (err) => {
                if (err) {
                    rej(err);
                    return;
                }
                console.log('Tokens saved');
                res();
            });
        });
    }

    private checkForTokens(): Promise<Credentials> {
        return new Promise((res, rej) => {
            readFile(this.tokenPath, { encoding: 'UTF-8' }, (err, data) => {
                if (err) {
                    rej(err);
                    return;
                }

                try {
                    const tokens: Credentials = JSON.parse(data);
                    console.log('Tokens retrieved');
                    res(tokens);
                } catch (err) {
                    rej(err);
                }
            });
        });
    }

    private getClient(): OAuth2Client {
        if (!this.oAuth2Client) {
            this.oAuth2Client = new google.auth.OAuth2(
                this.googleApisConfig.clientId,
                this.googleApisConfig.clientSecret,
                this.googleApisConfig.redirectUrls[0]
            );

            this.oAuth2Client.on('tokens', (tokens: Credentials) => {
                if (tokens.refresh_token) {
                    this.refreshToken = tokens.refresh_token;
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    this.oAuth2Client.setCredentials({ refresh_token: this.refreshToken })
                    console.log(tokens.refresh_token);
                }

                console.log(tokens.access_token);
            });
        }

        return this.oAuth2Client;
    }

}

export default ScheduleRepo;