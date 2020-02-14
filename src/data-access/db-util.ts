import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";

/**
 * Describes the database utilities
 */
export class DatabaseUtil {
    /**
     * Gets a database connection
     * 
     * @param database The expected database file location
     */
    public static getDbConnection(database: string): Promise<Database> {
        return new Promise<Database>((res, rej) => {
            const db: Database = new Database(database, OPEN_READWRITE | OPEN_CREATE, (err: Error) => {
                if (err) {
                    rej(err);
                    return;
                }
                res(db);
            });
        });
    }

    /**
     * Executes non query results
     * @param database Database
     * @param callback Callback
     */
    public static executeNonQueryDb(database: string, callback: (db: Database) => Promise<void>): Promise<void> {
        return this.executeResultsAsync<void>(database, callback);
    }

    /**
     * Executes query results
     * 
     * @param database The expected database file location
     * @param callback The db callback for commands
     */
    public static async executeResultsAsync<T>(database: string, callback: (db: Database) => Promise<T>): Promise<T> {
            let result: T;
            let db: Database;
            try {
                db = await DatabaseUtil.getDbConnection(database);

                result = await callback(db);

                await DatabaseUtil.closeDb(db);
                return result;
            } catch (err) {
                console.error(err);
                throw err;
            }
    }

    /**
     * Closes a database connection
     * 
     * @param db {Database} The database instance
     */
    public static async closeDb(db: Database): Promise<void> {
        return new Promise((res, rej) => {
            db.close((err) => {
                if (err) {
                    rej(err);
                    return;
                }
                res();
            });
        });
    }
}

export default DatabaseUtil;