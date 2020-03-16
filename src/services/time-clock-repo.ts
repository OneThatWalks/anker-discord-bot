import { inject, injectable } from 'tsyringe';
import AppConfig from '../models/app-config';
import { ITimeClockRepo, TimeClockRecord, TimeLoggedCriteria, TimeLoggedResult } from '../types';
import DatabaseUtil from './db-util';
import { Database } from 'sqlite3';
import { getDatesFromCriteria } from '../util';

@injectable()
class TimeClockRepo implements ITimeClockRepo {

    /**
     * Creates a time clock repository
     */
    constructor(@inject(AppConfig) private appConfig: AppConfig) {

    }

    public async lastClock(discordId: string): Promise<TimeClockRecord> {
        return await DatabaseUtil.executeResultsAsync<TimeClockRecord>(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql = 'SELECT * FROM TimeClock WHERE DiscordId = ? ORDER BY LoginDateTimeUtc DESC, LogoutDateTimeUtc DESC LIMIT 1;';

            db.get(sql, [discordId], (err: Error, row: TimeClockRecord) => {
                if (err) {
                    rej(err);
                    return;
                }

                // Sqlite does not bind correctly to Date type
                if (row.LoginDateTimeUtc) {
                    row.LoginDateTimeUtc = new Date(row.LoginDateTimeUtc);
                }

                if (row.LogoutDateTimeUtc) {
                    row.LogoutDateTimeUtc = new Date(row.LogoutDateTimeUtc);
                }

                res(row);
            });
        }));
    }

    async getPunches(discordIds: string[], criteria: TimeLoggedCriteria): Promise<TimeClockRecord[]> {
        const [start, end] = getDatesFromCriteria(criteria);

        return await DatabaseUtil.executeResultsAsync<TimeClockRecord[]>(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql = `SELECT * FROM TimeClock WHERE DiscordId IN (${discordIds.map(d => `?`).join(',')}) AND LoginDateTimeUtc > '${start.toISOString()}' AND LogoutDateTimeUtc < '${end.toISOString()}' ORDER BY LoginDateTimeUtc DESC, LogoutDateTimeUtc DESC LIMIT 1;`;

            db.all(sql, [...discordIds,], (err: Error, rows: TimeClockRecord[]) => {
                if (err) {
                    rej(err);
                    return;
                }

                // Fix sqlite dates
                const updatedRows = rows.map(row => {
                    // Sqlite does not bind correctly to Date type
                    if (row.LoginDateTimeUtc) {
                        row.LoginDateTimeUtc = new Date(row.LoginDateTimeUtc);
                    }

                    if (row.LogoutDateTimeUtc) {
                        row.LogoutDateTimeUtc = new Date(row.LogoutDateTimeUtc);
                    }

                    return row;
                });

                res(updatedRows);
            });
        }));
    }

    async recordLogin(discordId: string, date: Date): Promise<Date> {
        await DatabaseUtil.executeNonQueryDb(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql = `INSERT INTO TimeClock (DiscordId, LoginDateTimeUtc) VALUES (?, ?);`;

            db.run(sql, [discordId, date.toISOString()], (err) => {
                if (err) {
                    rej(err);
                    return;
                }

                res();
            });
        }));

        return date;
    }

    async recordLogout(discordId: string, date: Date, loginDate: Date): Promise<Date> {
        await DatabaseUtil.executeNonQueryDb(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql = `UPDATE TimeClock SET LogoutDateTimeUtc = ? WHERE DiscordId = ? AND LoginDateTimeUtc = ?;`;

            db.run(sql, [date.toISOString(), discordId, loginDate.toISOString()], (err) => {
                if (err) {
                    rej(err);
                    return;
                }

                res();
            });
        }));

        return date;
    }

    async getTimeLogged(discordIds: string[], criteria: TimeLoggedCriteria): Promise<TimeLoggedResult[]> {
        const [start, end] = getDatesFromCriteria(criteria);

        const results = await DatabaseUtil.executeResultsAsync<TimeLoggedResult[]>(this.appConfig.sqlite.databasePath, (db: Database) => new Promise((res, rej) => {
            const sql =
                `SELECT DiscordId as 'discordId', SUM(JULIANDAY(IFNULL(LogoutDateTimeUtc, 'now')) - JULIANDAY(LoginDateTimeUtc)) * 24 * 60 * 60 AS 'time', '${criteria}' as 'criteria' FROM TimeClock ` +
                `WHERE DiscordId IN (${discordIds.map((value: string, index: number) => `'${value}'${index === discordIds.length - 1 ? '' : ','}`)}) AND LoginDateTimeUtc > '${start.toISOString()}' ` +
                'GROUP BY DiscordId;';

            db.all(sql, (err: Error, rows: TimeLoggedResult[]) => {
                if (err) {
                    rej(err);
                    return;
                }

                res(rows);
            });
        }));

        return results;
    }
}

export default TimeClockRepo;