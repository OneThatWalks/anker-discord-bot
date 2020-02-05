import { Employee, IEmployeeRepo } from '../../typings';
import { Database } from 'sqlite3';
import DatabaseUtil from './db-util';

class EmployeeRepo implements IEmployeeRepo {

    /**
     * Initializes employee repo with database path
     * 
     * @param database The expected file location of the database
     */
    constructor(private database: string) {

    }

    addEmployee(employee: Employee): Promise<void> {
        return new Promise(async (res, rej) => {
            await DatabaseUtil.executeResultsAsync(this.database, async (db: Database) => {
                return this._addEmployee(employee, db);
            });
        });
    }

    private _addEmployee(employee: Employee, db: Database): Promise<void> {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO Employee (DiscordId, Name) VALUES(?, ?)`;

            db.run(sql, [employee.DiscordId, employee.Name], (err: Error) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('Employee(s) inserted');
                resolve();
            });
        });
    }

    removeEmployee(discordId: string): Promise<void> {
        return new Promise(async (res, rej) => {
            return DatabaseUtil.executeResultsAsync(this.database, async (db: Database) => {
                return this._removeEmployee(discordId, db);
            });
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

    getEmployee(discordId: string): Promise<Employee> {
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
            let em: Employee;
            const sql = `SELECT * FROM Employee WHERE DiscordId = ?`;

            db.get(sql, [discordId], (err: Error, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                // No data, record does not exist
                if (!row) {
                    resolve(null);
                    return;
                }

                console.log('Employee retrieved');

                // Read row
                em = {
                    DiscordId: row.DiscordId,
                    Name: row.Name
                };

                // Resolve promise
                resolve(em);
            });
        });
    }

}

export default EmployeeRepo;