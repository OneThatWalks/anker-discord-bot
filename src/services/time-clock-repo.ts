import { inject, injectable } from 'tsyringe';
import AppConfig from '../models/app-config';
import { ITimeClockRepo, TimeClockRecord, TimeLoggedCriteria, TimeLoggedResult } from '../types';
import DatabaseUtil from './db-util';
import { Database } from 'sqlite3';

@injectable()
class TimeClockRepo implements ITimeClockRepo {

    /**
     * Creates a time clock repository
     */
    constructor(@inject(AppConfig) private appConfig: AppConfig) {

    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async recordLogin(discordId: string): Promise<Date> {
        const lastLogin = await DatabaseUtil.executeResultsAsync<TimeClockRecord>(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql = 'SELECT * FROM TimeClock WHERE DiscordId = ? AND LogoutDateTimeUtc IS NULL ORDER BY LoginDateTimeUtc DESC LIMIT 1;';

            db.get(sql, [discordId], (err: Error, row: TimeClockRecord) => {
                if (err) {
                    rej(err);
                }

                res(row);
            });
        }));

        if (lastLogin) {
            if (lastLogin.LoginDateTimeUtc) {
                // Not a date so convert so we can localize
                lastLogin.LoginDateTimeUtc = new Date(lastLogin.LoginDateTimeUtc);
            }
            throw new Error(`There was an issue logging in.  Previous clock in detected at ${lastLogin.LoginDateTimeUtc.toLocaleString()}.`);
        }

        const loginDate = new Date();

        await DatabaseUtil.executeNonQueryDb(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql = `INSERT INTO TimeClock (DiscordId, LoginDateTimeUtc) VALUES (?, ?);`;

            db.run(sql, [discordId, loginDate.toISOString()], (err) => {
                if (err) {
                    rej(err);
                }

                res();
            });
        }));

        return loginDate;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async recordLogout(discordId: string): Promise<Date> {
        const lastLogin = await DatabaseUtil.executeResultsAsync<TimeClockRecord>(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql = 'SELECT * FROM TimeClock WHERE DiscordId = ? ORDER BY LoginDateTimeUtc DESC LIMIT 1;';

            db.get(sql, [discordId], (err: Error, row: TimeClockRecord) => {
                if (err) {
                    rej(err);
                }

                res(row);
            });
        }));

        if (!lastLogin || lastLogin.LogoutDateTimeUtc) {
            if (lastLogin && lastLogin.LogoutDateTimeUtc) {
                // Not a date so convert so we can localize
                lastLogin.LogoutDateTimeUtc = new Date(lastLogin.LogoutDateTimeUtc);
            }
            throw new Error(`There was an issue logging out.  Previous clock out detected at ${lastLogin?.LogoutDateTimeUtc?.toLocaleString() ?? 'never'}.`);
        }

        // TODO: Timezones my be nice
        const logoutDate = new Date();

        await DatabaseUtil.executeNonQueryDb(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql = `UPDATE TimeClock SET LogoutDateTimeUtc = ? WHERE DiscordId = ? AND LoginDateTimeUtc = ?;`;

            db.run(sql, [logoutDate.toISOString(), discordId, ((lastLogin.LoginDateTimeUtc as Date).toISOString == undefined ? lastLogin.LoginDateTimeUtc : lastLogin.LoginDateTimeUtc.toISOString())], (err) => {
                if (err) {
                    rej(err);
                }

                res();
            });
        }));

        return logoutDate;
    }

    async getTimeLogged(discordIds: string[], criteria: TimeLoggedCriteria): Promise<TimeLoggedResult[]> {
        throw Error('Method not implemented');
    }
}

export default TimeClockRepo;