import { inject, injectable } from 'tsyringe';
import { AppConfig } from '../models/app-config';
import { Employee, IDataAccess, IEmployeeRepo, IScheduleRepo, ITimeClockRepo, Schedule, TimeLoggedCriteria, TimeLoggedResult, TimeClockRecord } from '../types';
import fs from 'fs';
import * as path from 'path';

@injectable()
class DataAccess implements IDataAccess {

    /**
     * Creates an instance of the data access
     * 
     * @param config {AppConfig} Instance of the config object
     */
    constructor(@inject(AppConfig) private config: AppConfig,
        @inject("IEmployeeRepo") private employeeRepo: IEmployeeRepo,
        @inject("IScheduleRepo") private scheduleRepo: IScheduleRepo,
        @inject('ITimeClockRepo') private timeClockRepo: ITimeClockRepo) {
    }

    addEmployee(employee: Employee): Promise<void> {
        return this.employeeRepo.addEmployee(employee);
    }

    removeEmployee(discordId: string): Promise<void> {
        return this.employeeRepo.removeEmployee(discordId);
    }

    getEmployee(discordId: string): Promise<Employee> {
        return this.employeeRepo.getEmployee(discordId);
    }

    // TODO: Support query
    getEmployees(): Promise<Employee[]> {
        return this.employeeRepo.getEmployees();
    }

    recordLogin(discordId: string, date: Date): Promise<Date> {
        return this.timeClockRepo.recordLogin(discordId, date);
    }

    recordLogout(discordId: string, date: Date): Promise<Date> {
        return this.timeClockRepo.recordLogout(discordId, date);
    }

    getTimeLogged(discordIds: string[], criteria: TimeLoggedCriteria): Promise<TimeLoggedResult[]> {
        return this.timeClockRepo.getTimeLogged(discordIds, criteria);
    }

    getPunches(discordIds: string[], criteria: TimeLoggedCriteria): Promise<TimeClockRecord[]> {
        return this.timeClockRepo.getPunches(discordIds, criteria);
    }

    lastClock(discordId: string): Promise<TimeClockRecord> {
        return this.timeClockRepo.lastClock(discordId)
    }

    getSchedules(...employees: Employee[]): Promise<Schedule[]> {
        return this.scheduleRepo.getSchedules(...employees);
    }

    authorize(code: string): Promise<void> {
        return this.scheduleRepo.authorize(code);
    }

    async writeAsync(filePath: string, data: string): Promise<void> {
        await this.createDirectoryIfNotExists(filePath);

        return await this._writeAsync(filePath, data);
    }

    readAsync(filePath: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    private _writeAsync(filePath: string, data: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(filePath, data, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }

    private createDirectoryIfNotExists(filePath: string): Promise<void> {
        const dir = path.dirname(filePath);

        return new Promise((res, rej) => {
            fs.exists(dir, (exists) => {
                if (!exists) {
                    fs.mkdir(dir, (err) => {
                        if (err) {
                            rej(err);
                        } else {
                            res();
                        }
                    });
                } else {
                    res();
                }
            });
        });
    }

}

export default DataAccess;