import { Database } from 'sqlite3';
import { inject, injectable } from 'tsyringe';
import { AppConfig } from '../models/app-config';
import { Employee, IEmployeeRepo } from '../types';
import DatabaseUtil from './db-util';

@injectable()
class EmployeeRepo implements IEmployeeRepo {
    private database: string;

    /**
     * Initializes employee repo with database path
     * 
     * @param database The expected file location of the database
     */
    constructor(@inject(AppConfig) private appConfig: AppConfig) {
        this.database = appConfig.sqlite.databasePath;
    }

    public addEmployee(employee: Employee): Promise<void> {
        return DatabaseUtil.executeResultsAsync(this.database, async (db: Database) => {
            return this._addEmployee(employee, db);
        });
    }

    private _addEmployee(employee: Employee, db: Database): Promise<void> {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO Employee (DiscordId, Name, Email) VALUES(?, ?, ?)`;

            db.run(sql, [employee.DiscordId, employee.Name, employee.Email], (err: Error) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('Employee(s) inserted');
                resolve();
            });
        });
    }

    public removeEmployee(discordId: string): Promise<void> {
        return DatabaseUtil.executeResultsAsync(this.database, async (db: Database) => {
            return this._removeEmployee(discordId, db);
        });
    }

    /**
     * Removes an employee
     * @param discordId Discord id
     * @param db Database
     */
    private _removeEmployee(discordId: string, db: Database): Promise<void> {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM Employee WHERE DiscordId = ?`;

            db.run(sql, [discordId], (err: Error) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }
                console.log('Employee(s) deleted');
                resolve();
            });
        });
    }

    public getEmployee(discordId: string): Promise<Employee> {
        return DatabaseUtil.executeResultsAsync<Employee>(this.database, async (db: Database) => {
            return this._getEmployee(discordId, db);
        });
    }

    /**
     * Executes a get on the db
     * @param discordId Discord id
     * @param db Database
     */
    private _getEmployee(discordId: string, db: Database): Promise<Employee> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM Employee WHERE DiscordId = ?`;

            db.get(sql, [discordId], (err: Error, row: Employee) => {
                if (err) {
                    reject(err);
                    return;
                }

                // No data, record does not exist
                if (!row) {
                    resolve(null);
                    return;
                }

                // Resolve promise
                resolve(row);
            });
        });
    }

    public getEmployees(): Promise<Employee[]> {
        return DatabaseUtil.executeResultsAsync<Employee[]>(this.database, (db: Database) => new Promise<Employee[]>((res, rej) => {
            const sql = `SELECT * FROM Employee`;

            db.all(sql, (err: Error, rows: Employee[]) => {
                if (err) {
                    rej(err);
                }

                // No data, record does not exist
                if (!rows) {
                    res(null);
                }

                // Resolve promise
                res(rows);
            });
        }));
    }

}

export default EmployeeRepo;