import { Database } from "sqlite3";

/**
 * Describes the database utilities
 */
export class DatabaseUtil {
    /**
     * Gets a database connection
     * 
     * @param database The expected database file location
     */
    public static getDbConnection(database: string): Database {
        let db = new Database(database, (err: Error) => {
            if (err) {
                console.log(err.message);
            }
        });
        console.log('Connected to the anker-store database');
        return db;
    }

    /**
     * Executes commands in the database context
     * 
     * @param database The expected database file location
     * @param callback The db callback for commands
     */
    public static async executeDb(database: string, callback: (db: Database) => void) {
        const db = DatabaseUtil.getDbConnection(database);

        callback(db);

        db.close();
    }
}

export default DatabaseUtil;