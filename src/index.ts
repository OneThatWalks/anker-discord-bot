import "reflect-metadata";
import { DatabaseUtil } from './data-access/db-util';
import Bot from "./bot";
import { readFileSync } from 'fs';
import path = require('path');
import { container } from "tsyringe";
import ScheduleRepo from "./data-access/schedule-repo";
import EmployeeRepo from "./data-access/employee-repo";
import DataAccess from "./data-access/data-access";
import CommandExecutor from "./command-executor";
import { AppConfig } from "./models/app-config";
import RequestProcessorImpl from "./request-processor";

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

// Injection container setup \\

container.register('IScheduleRepo', {
    useClass: ScheduleRepo
});
container.register('IEmployeeRepo', {
    useClass: EmployeeRepo
});
container.register('IDataAccess', {
    useClass: DataAccess
});
container.register('RequestProcessor', {
    useClass: RequestProcessorImpl
});
container.register('ICommandExecutor', {
    useClass: CommandExecutor
});
container.register(AppConfig, {
    useValue: config
});

// async IIFE because life is hard
// Any unhandled exception will abort
(async (): Promise<void> => {
    await DatabaseUtil.executeResultsAsync(config.sqlite.databasePath, (db) => new Promise((res, rej) => {
        db.exec(sqlScript, (err: Error) => {
            if (err) {
                rej(err);
            }
            console.log('Database schema applied');
            res();
        });
    }));

    container.resolve(Bot);
})().catch((err) => {
    console.log(err);
    process.exit(1);
});
