import { IScheduleRepo, Employee, ScheduleRepoConfiguration } from '../../typings';
import { google } from 'googleapis';

class ScheduleRepo implements IScheduleRepo {


    private scope: string = 'https://www.googleapis.com/auth/calendar';
    private tokenPath: string = 'token.json';
    private oAuth2Client: any;
    private refresh_token: any;

    /**
     * Initializes the schedule repo
     */
    constructor(private scheduleRepoConfiguration: ScheduleRepoConfiguration) {
        this.authorize();
    }

    getSchedule(employee: Employee) {
        const calendar = google.calendar({version: 'v3', auth: this.getClient()});

        console.log(calendar.calendarList.list);
    }

    authorize(): void;
    authorize(code: string): void;
    authorize(code?: string) {
        const oAuth2Client = this.getClient();

        if (!code) {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.scope
            });
            console.log(`Please visit ${authUrl} to authorize this app.  Then message the bot with !authCode {code} without curly braces`);
            return;
        }

        oAuth2Client.getToken(code).then((value: any) => {
            const { tokens } = value;
            oAuth2Client.setCredentials(tokens);
        });
    }

    private getClient() {
        if (!this.oAuth2Client) {
            this.oAuth2Client = new google.auth.OAuth2(
                this.scheduleRepoConfiguration.clientId,
                this.scheduleRepoConfiguration.clientSecret,
                this.scheduleRepoConfiguration.redirectUrls[0]
            );

            this.oAuth2Client.on('tokens', (tokens: any) => {
                if (tokens.refresh_token) {
                    this.refresh_token = tokens.refresh_token;
                    this.oAuth2Client.setCredentials({refresh_token: this.refresh_token})
                    console.log(tokens.refresh_token);
                }

                console.log(tokens.access_token);
            });
        }
        
        return this.oAuth2Client;
    }

}

export default ScheduleRepo;