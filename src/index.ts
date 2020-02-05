import { DatabaseUtil } from './data-access/db-util';
import Bot from "./bot";
import { readFileSync } from 'fs';
import { AppConfig } from "../typings";
import path = require('path');

const args = process.argv.slice(2)
let configPath: string;

const configFileArgIndex = args.findIndex(arg => arg.toLowerCase() === '-configfile');

if (configFileArgIndex > -1) {
    configPath = args[configFileArgIndex + 1];
}

if (!configPath) {
    process.exit(1);
}

const data = readFileSync(configPath, { encoding: 'UTF-8' });

const config: AppConfig = JSON.parse(data);
const sqlScript = readFileSync(path.join(__dirname, config.sqlite.schemaPath), { encoding: 'UTF-8' });

// async IIFE because life is hard
// Any unhandled exception will abort
(async () => {
    try {
        await DatabaseUtil.executeResultsAsync(config.sqlite.databasePath, async (db) => new Promise((res, rej) => {
            db.exec(sqlScript, (err: Error) => {
                if (err) {
                    rej(err);
                }
                console.log('Database schema applied');
                res();
            });
        }));

        const bot = new Bot(config);
    } catch (err) {
        throw err;
    }
})().catch((err) => {
    console.log(err);
    process.exit(1);
});
