import 'reflect-metadata';
import AppConfig from '../src/models/app-config'
import DataAccess from '../src/services/data-access';
import { Mock, It, Times } from 'moq.ts';
import { IEmployeeRepo, IScheduleRepo, ITimeClockRepo, Employee, Schedule, ScheduleDay } from '../src/types';
import { equal } from 'assert';
import { assert } from 'chai';

describe('Data Access', () => {
    let service: DataAccess;
    let mockAppConfig: Mock<AppConfig>;
    let mockEmployeeRepo: Mock<IEmployeeRepo>;
    let mockScheduleRepo: Mock<IScheduleRepo>;
    let mockTimeClockRepo: Mock<ITimeClockRepo>;


    beforeEach(() => {
        mockAppConfig = new Mock<AppConfig>();
        mockEmployeeRepo = new Mock<IEmployeeRepo>();
        mockScheduleRepo = new Mock<IScheduleRepo>();
        mockTimeClockRepo = new Mock<ITimeClockRepo>();

        // Setup SUT
        service = new DataAccess(mockAppConfig.object(),
            mockEmployeeRepo.object(),
            mockScheduleRepo.object(),
            mockTimeClockRepo.object());
    });

    describe('addEmployee()', () => {

        it('should call employee repo', async () => {
            // Arrange
            mockEmployeeRepo.setup(instance => instance.addEmployee(It.IsAny<Employee>())).returns(Promise.resolve());
            const employee: Employee = {
                DiscordId: '123',
                Name: 'Test',
                Email: null
            }

            // Act
            await service.addEmployee(employee);

            // Assert
            mockEmployeeRepo.verify(instance => instance.addEmployee(It.IsAny<Employee>()), Times.Exactly(1));
        });

    });

    describe('removeEmployee()', () => {
        it('should call employee repo', async () => {
            // Arrange
            mockEmployeeRepo.setup(instance => instance.removeEmployee(It.IsAny<string>())).returns(Promise.resolve());

            // Act
            await service.removeEmployee('123');

            // Assert
            mockEmployeeRepo.verify(instance => instance.removeEmployee(It.IsAny<string>()), Times.Exactly(1));
        });
    });

    describe('getEmployee()', () => {
        it('should call employee repo and return expected employee', async () => {
            // Arrange
            const employee: Employee = {
                DiscordId: '123',
                Name: 'Test',
                Email: null
            }
            mockEmployeeRepo.setup(instance => instance.getEmployee(It.IsAny<string>())).returns(Promise.resolve<Employee>(employee));

            // Act
            const result = await service.getEmployee('123');

            // Assert
            equal(result.DiscordId, employee.DiscordId);
            mockEmployeeRepo.verify(instance => instance.getEmployee(It.IsAny<string>()), Times.Exactly(1));
        });
    });

    describe('recordLogin()', () => {
        it('should call time clock repo', async () => {
            // Arrange
            mockTimeClockRepo.setup(instance => instance.recordLogin(It.IsAny<string>(), It.IsAny<Date>())).returns(Promise.resolve());

            // Act
            await service.recordLogin('123', new Date());

            // Assert
            mockTimeClockRepo.verify(instance => instance.recordLogin(It.IsAny<string>(), It.IsAny<Date>()), Times.Exactly(1));
        });
    });

    describe('recordLogout()', () => {
        it('should call time clock repo', async () => {
            // Arrange
            mockTimeClockRepo.setup(instance => instance.recordLogout(It.IsAny<string>(), It.IsAny<Date>())).returns(Promise.resolve());

            // Act
            await service.recordLogout('123', new Date());

            // Assert
            mockTimeClockRepo.verify(instance => instance.recordLogout(It.IsAny<string>(), It.IsAny<Date>()), Times.Exactly(1));
        });
    });

    describe('getSchedule()', () => {
        it('should call schedule repo', async () => {
            // Arrange
            const employee: Employee = {
                DiscordId: '123',
                Name: 'Test',
                Email: null
            }
            mockScheduleRepo.setup(instance => instance.getSchedules(It.IsAny<Employee>())).returns(Promise.resolve<Schedule[]>([{ days: null, employee: null }]));

            // Act
            await service.getSchedules(employee);

            // Assert
            mockScheduleRepo.verify(instance => instance.getSchedules(It.IsAny<Employee>()), Times.Exactly(1));
        });

        it('should return schedule', async () => {
            // Arrange
            const employee: Employee = {
                DiscordId: '123',
                Name: 'Test',
                Email: null
            }
            const days: ScheduleDay[] = [
                {
                    start: new Date(),
                    end: new Date()
                }
            ]
            mockScheduleRepo.setup(instance => instance.getSchedules(It.IsAny<Employee>())).returns(Promise.resolve<Schedule[]>([{ days: days, employee: employee }]));

            // Act
            const result = await service.getSchedules(employee);

            // Assert
            assert.isNotNull(result);
        });
    });

    describe('authorize()', () => {
        it('should call schedule repo', async () => {
            // Arrange
            mockScheduleRepo.setup(instance => instance.authorize(It.IsAny<string>())).returns(Promise.resolve());

            // Act
            await service.authorize('code');

            // Assert
            mockScheduleRepo.verify(instance => instance.authorize(It.IsAny<string>()), Times.Exactly(1));
        });
    });

});