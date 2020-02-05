import { AppConfig } from './../../typings/index.d';
import { IDataAccess, Employee } from '../../typings';
import EmployeeRepo from './employee-repo';
import ScheduleRepo from './schedule-repo';

class DataAccess implements IDataAccess {
    
    
    private employeeRepo: EmployeeRepo;
    private scheduleRepo: ScheduleRepo;

    /**
     * Creates an instance of the data access
     * 
     * @param config {AppConfig} Instance of the config object
     */
    constructor(private config: AppConfig) {
        this.employeeRepo = new EmployeeRepo(config.sqlite.databasePath);
        this.scheduleRepo = new ScheduleRepo(config.googleapis);
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

    getSchedule(employee: Employee): any {
        return this.scheduleRepo.getSchedule(employee);
    }

    authorize(): void;
    authorize(code: string): void;
    authorize(code?: string) {
        if (!code) {
            return this.scheduleRepo.authorize();
        }
        return this.scheduleRepo.authorize(code);
    }

}

export default DataAccess;