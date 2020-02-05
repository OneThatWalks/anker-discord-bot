import { GoogleApisConfig, Schedule } from './../../typings/index.d';
import { IScheduleRepo, Employee } from '../../typings';
import { google } from 'googleapis';
import { readFile, writeFile } from 'fs';

class ScheduleRepo implements IScheduleRepo {

    // TODO:: Move google api "client" out of this class or rename and keep ctor

    private scope: string = 'https://www.googleapis.com/auth/calendar';
    private tokenPath: string = './tokens.json';
    private oAuth2Client: any;
    private refresh_token: any;

    /**
     * Initializes the schedule repo
     */
    constructor(private googleApisConfig: GoogleApisConfig) {
        this.authorize();
    }

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

            console.log(results);

            // TODO: Do work
        } catch (err) {
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
                access_type: 'offline',
                scope: this.scope
            });
            console.log(`Please visit ${authUrl} to authorize this app.  Then message the bot with !authCode {code} without curly braces`);
            return;
        }

        oAuth2Client.getToken(code).then(async (value: any) => {
            const { tokens } = value;
            oAuth2Client.setCredentials(tokens);
            await this.saveTokens(tokens);
            console.log('Authenticated');
        });
    }

    private saveTokens(tokens: any) {
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

    private checkForTokens(): Promise<any> {
        return new Promise((res, rej) => {
            readFile(this.tokenPath, { encoding: 'UTF-8' }, (err, data) => {
                if (err) {
                    rej(err);
                    return;
                }

                try {
                    const tokens = JSON.parse(data);
                    console.log('Tokens retrieved');
                    res(tokens);
                } catch (err) {
                    rej(err);
                }
            });
        });
    }

    private getClient() {
        if (!this.oAuth2Client) {
            this.oAuth2Client = new google.auth.OAuth2(
                this.googleApisConfig.clientId,
                this.googleApisConfig.clientSecret,
                this.googleApisConfig.redirectUrls[0]
            );

            this.oAuth2Client.on('tokens', (tokens: any) => {
                if (tokens.refresh_token) {
                    this.refresh_token = tokens.refresh_token;
                    this.oAuth2Client.setCredentials({ refresh_token: this.refresh_token })
                    console.log(tokens.refresh_token);
                }

                console.log(tokens.access_token);
            });
        }

        return this.oAuth2Client;
    }

}

export default ScheduleRepo;