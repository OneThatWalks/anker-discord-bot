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

    async addEmployee(employee: Employee): Promise<void> {
        return new Promise((res, rej) => {
            DatabaseUtil.executeDb(this.database, (db: Database) => {
                const sql = `INSERT INTO Employee (DiscordId, Name) VALUES(?, ?)`;
    
                db.run(sql, [employee.DiscordId, employee.Name], (err: Error) => {
                    if (err) {
                        console.log(err.message);
                        rej(err);
                    }
                    console.log('Employee(s) inserted');
                    res();
                });
            });
        });
    }

    async removeEmployee(discordId: string): Promise<void> {
        return new Promise((res, rej) => {
            DatabaseUtil.executeDb(this.database, (db: Database) => {
                const sql = `DELETE FROM Employee WHERE DiscordId = ?`;
    
                db.run(sql, [discordId], (err: Error) => {
                    if (err) {
                        console.log(err.message);
                        rej(err);
                    }
                    console.log('Employee(s) deleted');
                    res();
                });
            });
        });
    }

    async getEmployee(discordId: string): Promise<Employee> {
        return new Promise((res, rej) => {
            let em: Employee;

            DatabaseUtil.executeDb(this.database, (db: Database) => {
                const sql = `SELECT * FROM Employee WHERE DiscordId = ?`;
    
                db.get(sql, [discordId], (err: Error, row: any) => {
                    if (err) {
                        console.log(err.message);
                        rej(err);
                    }
    
                    if (!row) {
                        res(null);
                    }
    
                    console.log('Employee retrieved');
    
                    em = {
                        DiscordId: row.DiscordId,
                        Name: row.Name
                    };
                    
                    res(em);
                });
            });
        });
    }

}

export default EmployeeRepo;