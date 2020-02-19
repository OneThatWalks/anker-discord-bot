import { readFileSync } from 'fs';
import 'reflect-metadata';
import { container } from 'tsyringe';
import Bot from './bot';
import { AppConfig } from './models/app-config';
import DataAccess from './services/data-access';
import DatabaseUtil from './services/db-util';
import EmployeeRepo from './services/employee-repo';
import RequestProcessorImpl from './services/request-processor';
import ScheduleRepo from './services/schedule-repo';
import TimeClockRepo from './services/time-clock-repo';
import { IScheduleRepo } from './types/index.d';
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

// Injection container setup \\

container.register('IScheduleRepo', {
    useClass: ScheduleRepo
});
container.register('IEmployeeRepo', {
    useClass: EmployeeRepo
});
container.register('ITimeClockRepo', {
    useClass: TimeClockRepo
});
container.register('IDataAccess', {
    useClass: DataAccess
});
container.register('RequestProcessor', {
    useClass: RequestProcessorImpl
});
container.register(AppConfig, {
    useValue: config
});

// async IIFE because life is hard
// Any unhandled exception will abort
(async (): Promise<void> => {
    await DatabaseUtil.executeNonQueryDb(config.sqlite.databasePath, (db) => new Promise((res, rej) => {
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
