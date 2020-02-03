import { IDataAccess, DataAccessConfiguration, Employee } from '../../typings';
import EmployeeRepo from './employee-repo';

class DataAccess implements IDataAccess {
    private employeeRepo: EmployeeRepo;

    /**
     * Creates an instance of the data access
     * 
     * @param dataAccessConfiguration {DataAccessConfiguration} Instance of the data access config object
     */
    constructor(private dataAccessConfiguration: DataAccessConfiguration) {
        this.employeeRepo = new EmployeeRepo(dataAccessConfiguration.databasePath);
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
        return 'Test';
    }

}

export default DataAccess;