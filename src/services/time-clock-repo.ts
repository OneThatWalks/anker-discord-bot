import { inject, injectable } from 'tsyringe';
import AppConfig from '../models/app-config';
import { ITimeClockRepo, TimeClockRecord } from '../types';
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
    async recordLogin(discordId: string): Promise<void> {
        const lastLogin = await DatabaseUtil.executeResultsAsync<TimeClockRecord>(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql = 'SELECT * FROM TimeClock WHERE DiscordId = ? AND LogoutDateTimeUtc IS NULL ORDER BY LogoutDateTimeUtc DESC LIMIT 1;';

            db.get(sql, [discordId], (err: Error, row: TimeClockRecord) => {
                if (err) {
                    rej(err);
                }

                res(row);
            });
        }));

        if (lastLogin) {
            throw new Error(`There was an issue logging in.  Previous clock in detected at ${lastLogin.LoginDateTimeUtc.toLocaleString()}.`);
        }

        return await DatabaseUtil.executeNonQueryDb(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql = `INSERT INTO TimeClock (DiscordId, LoginDateTimeUtc) VALUES (?, ?);`;

            db.run(sql, [discordId, new Date().toUTCString()], (err) => {
                if (err) {
                    rej(err);
                }

                res();
            });
        }));
    }    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async recordLogout(discordId: string): Promise<void> {
        const lastLogout = await DatabaseUtil.executeResultsAsync<TimeClockRecord>(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql = 'SELECT * FROM TimeClock WHERE DiscordId = ? AND LogoutDateTimeUtc IS NULL ORDER BY LogoutDateTimeUtc DESC LIMIT 1;';

            db.get(sql, [discordId], (err: Error, row: TimeClockRecord) => {
                if (err) {
                    rej(err);
                }

                res(row);
            });
        }));

        if (lastLogout?.LogoutDateTimeUtc) {
            throw new Error(`There was an issue logging out.  Previous clock out detected at ${lastLogout.LogoutDateTimeUtc.toLocaleString()}.`);
        }

        // TODO: The schema isn't compatible with this query Id autoincrement was not on
        // Rather use a compound key for indexing

        return await DatabaseUtil.executeNonQueryDb(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql = `UPDATE TimeClock SET LogoutDateTimeUtc = ? WHERE Id = ?;`;

            db.run(sql, [new Date().toUTCString(), lastLogout.Id], (err) => {
                if (err) {
                    rej(err);
                }

                res();
            });
        }));
    }
}

export default TimeClockRepo;