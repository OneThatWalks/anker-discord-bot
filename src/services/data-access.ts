import { inject, injectable } from 'tsyringe';
import { AppConfig } from '../models/app-config';
import { Employee, IDataAccess, IEmployeeRepo, IScheduleRepo, ITimeClockRepo, Schedule, TimeLoggedCriteria, TimeLoggedResult } from '../types';

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

    recordLogin(discordId: string): Promise<Date> {
        return this.timeClockRepo.recordLogin(discordId);
    }

    recordLogout(discordId: string): Promise<Date> {
        return this.timeClockRepo.recordLogout(discordId);
    }

    getTimeLogged(discordIds: string[], criteria: TimeLoggedCriteria): Promise<TimeLoggedResult[]> {
        return this.timeClockRepo.getTimeLogged(discordIds, criteria);
    }

    getSchedules(...employees: Employee[]): Promise<Schedule[]> {
        return this.scheduleRepo.getSchedules(...employees);
    }

    authorize(code: string): Promise<void> {
        return this.scheduleRepo.authorize(code);
    }

}

export default DataAccess;