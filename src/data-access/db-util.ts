import { Database, OPEN_READWRITE, OPEN_CREATE } from "sqlite3";

/**
 * Describes the database utilities
 */
export class DatabaseUtil {
    /**
     * Gets a database connection
     * 
     * @param database The expected database file location
     */
    public static async getDbConnection(database: string): Promise<Database> {
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
     * Executes commands in the database context
     * 
     * @param database The expected database file location
     * @param callback The db callback for commands
     */
    public static async executeDb(database: string, callback: (db: Database) => Promise<void>): Promise<void> {
        return new Promise(async (res, rej) => {
            let db: Database;
            try {
                db = await DatabaseUtil.getDbConnection(database);

                console.log('Connected to the database');

                await callback(db);

                await DatabaseUtil.closeDb(db);
                res();
            } catch (err) {
                rej(err);
                return;
            }
        });
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