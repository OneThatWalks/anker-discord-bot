import { sqlite3, Database, RunResult } from "sqlite3";

export class Employee {
    DiscordId: string;
    Name: string;
}

export interface IDataAccess extends IEmployeeRepo, ITimeClockRepo, ICalendarRepo {
}

export interface IEmployeeRepo {
    addEmployee(employee: Employee): void;
    removeEmployee(discordId: string): void;
}

export interface ITimeClockRepo {
    recordLogin(discordId: string): void;
    recordLogout(discordId: string): void;
}

export interface ICalendarRepo {

}

export class DataAccessConfiguration {
    databasePath: string;
}

export class EmployeeRepo implements IEmployeeRepo {

    /**
     * Initializes employee repo with database path
     * 
     * @param database The expected file location of the database
     */
    constructor(private database: string) {
        
    }

    addEmployee(employee: Employee): void {
        DatabaseUtil.executeDb(this.database, (db: Database) => {
            const sql = `INSERT INTO Employee (DiscordId, Name) VALUES(?)`;

            db.run(sql, [employee.DiscordId, employee.Name], (result: RunResult, err: Error) => {
                if (err) {
                    console.log(err.message);
                }
                console.log('Employee(s) inserted: ' + result.changes);
            });
        });
    }    

    removeEmployee(discordId: string): void {
        DatabaseUtil.executeDb(this.database, (db: Database) => {
            const sql = `DELETE FROM Employee WHERE DiscordId = ?`;

            db.run(sql, [discordId], (result: RunResult, err: Error) => {
                if (err) {
                    console.log(err.message);
                }
                console.log('Employee(s) deleted: ' + result.changes);
            });
        });
    }



}

export class DatabaseUtil {
    /**
     * Gets a database connection
     * 
     * @param database The expected database file location
     */
    public static getDbConnection(database: string): Database {
        let db = new Database('../db/anker-store.db', (err: Error) => {
            if (err) {
                console.log(err.message);
            }
        });
        console.log('Connected to the anker-store database');
        return db;
    }

    /**
     * 
     * @param database The expected database file location
     * @param callback The db callback for commands
     */
    public static executeDb(database: string, callback: (db: Database) => void) {
        const db = DatabaseUtil.getDbConnection(database);

        callback(db);

        db.close();
    }
}

class DataAccess implements IDataAccess {
    private employeeRepo: EmployeeRepo;

    /**
     *
     */
    constructor(private dataAccessConfiguration: DataAccessConfiguration) {
        this.employeeRepo = new EmployeeRepo(dataAccessConfiguration.databasePath);
    }

    addEmployee(employee: Employee): void {
        return this.employeeRepo.addEmployee(employee);
    }

    removeEmployee(discordId: string): void {
        return this.employeeRepo.removeEmployee(discordId);
    }

    recordLogin(discordId: string): void {
        throw new Error("Method not implemented.");
    }

    recordLogout(discordId: string): void {
        throw new Error("Method not implemented.");
    }

    

}

export default DataAccess;