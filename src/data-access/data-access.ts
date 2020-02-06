import { Schedule, IEmployeeRepo, IScheduleRepo } from '../typings';
import { IDataAccess, Employee } from '../typings';
import { injectable, inject } from 'tsyringe';
import { AppConfig } from '../models/app-config';

@injectable()
class DataAccess implements IDataAccess {

    /**
     * Creates an instance of the data access
     * 
     * @param config {AppConfig} Instance of the config object
     */
    constructor(@inject(AppConfig) private config: AppConfig,
                @inject("IEmployeeRepo") private employeeRepo: IEmployeeRepo,
                @inject("IScheduleRepo") private scheduleRepo: IScheduleRepo) {
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

    recordLogin(discordId: string): void {
        throw new Error("Method not implemented.");
    }

    recordLogout(discordId: string): void {
        throw new Error("Method not implemented.");
    }

    getSchedule(employee: Employee): Promise<Schedule> {
        return this.scheduleRepo.getSchedule(employee);
    }

    authorize(): Promise<void>;
    authorize(code: string): Promise<void>;
    authorize(code?: string): Promise<void> {
        if (!code) {
            return this.scheduleRepo.authorize();
        }
        return this.scheduleRepo.authorize(code);
    }

}

export default DataAccess;