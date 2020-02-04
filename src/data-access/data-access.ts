import { IDataAccess, DataAccessConfiguration, Employee } from '../../typings';
import EmployeeRepo from './employee-repo';
import ScheduleRepo from './schedule-repo';

class DataAccess implements IDataAccess {
    
    
    private employeeRepo: EmployeeRepo;
    private scheduleRepo: ScheduleRepo;

    /**
     * Creates an instance of the data access
     * 
     * @param dataAccessConfiguration {DataAccessConfiguration} Instance of the data access config object
     */
    constructor(private dataAccessConfiguration: DataAccessConfiguration) {
        this.employeeRepo = new EmployeeRepo(dataAccessConfiguration.databasePath);
        this.scheduleRepo = new ScheduleRepo(dataAccessConfiguration.scheduleRepo);
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