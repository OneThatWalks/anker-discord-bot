/* eslint-disable @typescript-eslint/camelcase */
import { calendar_v3, google } from "googleapis";
import { Credentials, OAuth2Client } from 'google-auth-library';
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
import { injectable, inject } from "tsyringe";
import AppConfig from "../models/app-config";
import { readFile, writeFile } from "fs";
import GoogleEventDto from "../models/google-event-dto";
import { GoogleApiClient, DiscordClient, GoogleEvent } from "../types";

/**
 * The google api client implementation
 * 
 * @remarks
 *  This will abstract the google apis logic away from our code
 *  while also being a scoped life for dependency injection
 */
@injectable()
class GoogleApiClientImpl implements GoogleApiClient {

    /**
     * The OAuth 2.0 client instance
     *
     * @private
     * @type {OAuth2Client}
     * @memberof GoogleApiClientImpl
     */
    private oAuth2Client: OAuth2Client;

    /**
     * In-memory refresh token so we shouldn't have to read files all the time
     *
     * @private
     * @type {string}
     * @memberof GoogleApiClientImpl
     */
    private refreshToken: string;

    /**
     * The path for saving tokens
     *
     * @private
     * @memberof GoogleApiClientImpl
     */
    private tokenPath = './tokens.json';

    /**
     * The scope to request for the auth client
     *
     * @private
     * @memberof GoogleApiClientImpl
     */
    private scope = 'https://www.googleapis.com/auth/calendar';

    /**
     * Creates an instance of the google api client
     * @param appConfig The application configuration object
     */
    constructor(@inject(AppConfig) private appConfig: AppConfig, @inject('DiscordClient') private discordClient: DiscordClient) {
        this.initOAuth2Client();
        (async (): Promise<void> => {
            if (!this.oAuth2Client.credentials.expiry_date) {
                // Need to authenticate
                await this.authorize();
            }
        })();
    }

    private async authorize(): Promise<void> {
        // First check for tokens previously saved
        try {
            const tokens = await this.checkForTokens();
            if (tokens) {
                this.oAuth2Client.setCredentials(tokens);
                return;
            }
        } catch (err) {
            console.error('There was an issue getting tokens from file. Proceeding to authentication flow.');
        }

        // No saved tokens means user intervention
        await this.generateAuthUrl();
    }

    private async generateAuthUrl(): Promise<void> {
        const authUrl = this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.scope
        });

        // Attempt to message admin users
        await this.discordClient.messageRoleUsers('Administrator', `Help me authenticate with google, visit ${authUrl}.\r\nOnce you have the code, message me with the command \`!authcode {code-without-curly-braces}\``);
        console.info(`Authenticate bot at ${authUrl}.  Then reply to the bot with '!authcode {code-without-curly-braces}'`);
    }

    /**
     * Initializes the Google OAuth2.0 Client
     */
    private initOAuth2Client(): void {
        this.oAuth2Client = new google.auth.OAuth2(
            this.appConfig.googleapis.clientId,
            this.appConfig.googleapis.clientSecret,
            this.appConfig.googleapis.redirectUrls[0]
        )

        this.oAuth2Client.on('tokens', (tokens: Credentials) => {
            if (tokens.refresh_token) {
                this.refreshToken = tokens.refresh_token;
                this.oAuth2Client.setCredentials({ refresh_token: this.refreshToken })
                console.log('Google Api Client Authenticated');
                console.debug(`Refresh token ${tokens.refresh_token}`);
            }

            console.debug(`Access token ${tokens.access_token}`);
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

    /**
     * Checks the local tokens file for credentials
     */
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

    public async authorizeWithCode(code: string): Promise<void> {
        this.oAuth2Client.getToken(code).then(async (value: GetTokenResponse) => {
            const { tokens } = value;
            this.oAuth2Client.setCredentials(tokens);
            console.log('Google Api Client Authenticated');
            await this.discordClient.messageRoleUsers('Administrator', 'Google Api Client Authenticated Successfully');
            await this.saveTokens(tokens);
        });
    }

    get isAuthorized(): boolean {
        return !this.oAuth2Client.credentials.expiry_date;
    }

    public async getCalendarEvents(startDateTime: Date, endDateTime: Date): Promise<GoogleEvent[]> {
        const calendar: calendar_v3.Calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });

        if (!endDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 7);
        }

        const googleApiResult = await calendar.events.list({
            calendarId: this.appConfig.googleapis.calendar.calendarId,
            timeMin: startDateTime.toISOString(),
            timeMax: endDateTime.toISOString()
        });

        if (googleApiResult.status !== 200) {
            throw new Error(`There was an issue retrieving google events.  Calendar Id [${this.appConfig.googleapis.calendar}]`);
        }

        return googleApiResult.data.items.map(evt => new GoogleEventDto(evt));
    }

}

export default GoogleApiClientImpl;