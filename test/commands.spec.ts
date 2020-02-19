import 'reflect-metadata';
import AuthorizeCommand from '../src/services/discord-commands/authorize-command';
import ScheduleCommand from '../src/services/discord-commands/schedule-command';
import LoginCommand from '../src/services/discord-commands/login-command';
import LogoutCommand from '../src/services/discord-commands/logout-command';
import { DiscordRequest, IDataAccess, MessageActionTypes, Employee, Schedule } from '../src/types';
import { Mock, It, Times } from 'moq.ts';
import MessageWrapper from '../src/models/message-wrapper';
import { Message, User, Client, UserStore } from 'discord.js';

describe('Commands', () => {
    let mockRequest: Mock<DiscordRequest>;

    describe('Authorize Command', () => {
        let service: AuthorizeCommand;
        let mockDataAccess: Mock<IDataAccess>;

        beforeEach(() => {
            // Mock request
            mockRequest = new Mock<DiscordRequest>();
            mockDataAccess = new Mock<IDataAccess>()
            mockDataAccess.setup(instance => instance.authorize(It.IsAny())).returns(new Promise((res) => res()));
            mockRequest.setup(instance => instance.args).returns(['xyz']);
            mockRequest.setup(instance => instance.action).returns(MessageActionTypes.AUTH_CODE);
            mockRequest.setup(instance => instance.dataAccess).returns(mockDataAccess.object());

            // Create service
            service = new AuthorizeCommand(mockRequest.object());
        });

        it('should call authorize on execute', async () => {
            // Arrange

            // Act
            await service.execute();

            // Assert
            mockDataAccess.verify(instance => instance.authorize(It.IsAny()), Times.Exactly(1))
        });

        it('should call authorize with arg', async () => {
            // Arrange

            // Act
            await service.execute();

            // Assert
            mockDataAccess.verify(instance => instance.authorize(It.Is(value => value === 'xyz')), Times.Exactly(1))
        });

    });

    describe('Schedule Command (No Args)', () => {
        let service: ScheduleCommand;
        let mockDataAccess: Mock<IDataAccess>;
        let mockMessage: Mock<MessageWrapper>;
        const mockEmployee: Employee = {
            DiscordId: '123',
            Name: 'Test',
            Email: null
        };
        const mockSchedule: Schedule = {
            days: [
                {
                    start: new Date(),
                    end: new Date()
                }
            ],
            employee: mockEmployee
        }

        beforeEach(() => {
            // Mock request
            mockMessage = new Mock<MessageWrapper>();
            mockMessage.setup(instance => instance.authorId).returns('123');
            mockMessage.setup(instance => instance.author).returns('Test');
            mockMessage.setup(instance => instance.replyCallback(It.IsAny())).returns(Promise.resolve<Message>(new Mock<Message>().object()));

            mockDataAccess = new Mock<IDataAccess>();
            mockDataAccess.setup(instance => instance.getEmployee(It.IsAny())).returns(Promise.resolve<Employee>(mockEmployee));
            mockDataAccess.setup(instance => instance.addEmployee(It.IsAny())).returns(Promise.resolve());
            mockDataAccess.setup(instance => instance.getSchedule(It.IsAny())).returns(Promise.resolve<Schedule>(mockSchedule));

            mockRequest = new Mock<DiscordRequest>();
            mockRequest.setup(instance => instance.args).returns([]);
            mockRequest.setup(instance => instance.message).returns(mockMessage.object());
            mockRequest.setup(instance => instance.action).returns(MessageActionTypes.SCHEDULE);
            mockRequest.setup(instance => instance.dataAccess).returns(mockDataAccess.object());

            // Create service
            service = new ScheduleCommand(mockRequest.object());
        });

        it('should call dataAccess twice', async () => {
            // Arrange

            // Act
            await service.execute();

            // Assert
            mockDataAccess.verify(instance => instance.getEmployee(It.IsAny()), Times.Exactly(1));
            mockDataAccess.verify(instance => instance.getSchedule(It.IsAny()), Times.Exactly(1));
        });

        it('should call dataAccess three times when employee doesn\'t exist', async () => {
            // Arrange
            mockDataAccess.setup(instance => instance.getEmployee(It.IsAny())).returns(Promise.resolve<Employee>(null));

            // Act
            await service.execute();

            // Assert
            mockDataAccess.verify(instance => instance.getEmployee(It.IsAny()), Times.Exactly(1));
            mockDataAccess.verify(instance => instance.addEmployee(It.IsAny()), Times.Exactly(1));
            mockDataAccess.verify(instance => instance.getSchedule(It.IsAny()), Times.Exactly(1));
        });

        it('should reply', async () => {
            // Arrange

            // Act
            await service.execute();

            // Assert
            mockMessage.setup(instance => instance.replyCallback(It.IsAny())).returns(Promise.resolve<Message>(new Mock<Message>().object()))
        });

    });

    describe('Schedule Command (all)', () => {
        let service: ScheduleCommand;
        let mockDataAccess: Mock<IDataAccess>;
        let mockMessage: Mock<MessageWrapper>;
        const mockEmployee: Employee = {
            DiscordId: '123',
            Name: 'Test',
            Email: null
        };

        const mockEmployee2: Employee = {
            DiscordId: '456',
            Name: 'Test2',
            Email: null
        };

        const mockEmployees = [
            mockEmployee,
            mockEmployee2
        ]

        const mockSchedules: Schedule[] = [
            {
                days: [
                    {
                        start: new Date(),
                        end: new Date()
                    }
                ],
                employee: mockEmployee
            },
            {
                days: [
                    {
                        start: new Date(),
                        end: new Date()
                    }
                ],
                employee: mockEmployee2
            }
        ];

        beforeEach(() => {
            // Mock request
            mockMessage = new Mock<MessageWrapper>();
            mockMessage.setup(instance => instance.authorId).returns('123');
            mockMessage.setup(instance => instance.author).returns('Test');
            mockMessage.setup(instance => instance.replyCallback(It.IsAny())).returns(Promise.resolve<Message>(new Mock<Message>().object()));
            mockMessage.setup(instance => instance.findUser(It.IsAny())).returns(new Mock<User>().object());

            mockDataAccess = new Mock<IDataAccess>();
            mockDataAccess.setup(instance => instance.getEmployee(It.IsAny())).returns(Promise.resolve<Employee>(mockEmployee));
            mockDataAccess.setup(instance => instance.getEmployees()).returns(Promise.resolve<Employee[]>(mockEmployees));
            mockDataAccess.setup(instance => instance.addEmployee(It.IsAny())).returns(Promise.resolve());
            mockDataAccess.setup(instance => instance.getSchedules(It.IsAny<Employee[]>())).returns(Promise.resolve<Schedule[]>(mockSchedules));

            mockRequest = new Mock<DiscordRequest>();
            mockRequest.setup(instance => instance.args).returns(['all']);
            mockRequest.setup(instance => instance.message).returns(mockMessage.object());
            mockRequest.setup(instance => instance.action).returns(MessageActionTypes.SCHEDULE);
            mockRequest.setup(instance => instance.dataAccess).returns(mockDataAccess.object());

            // Create service
            service = new ScheduleCommand(mockRequest.object());
        });

        it('should get all employees and schedules', async () => {
            // Arrange

            // Act
            await service.execute();

            // Assert
            mockDataAccess.verify(instance => instance.getEmployees(), Times.Exactly(1));
            mockDataAccess.verify(instance => instance.getSchedules(It.IsAny<Employee[]>()), Times.Exactly(1));
        });

        it('should reply', async () => {
            // Arrange

            // Act
            await service.execute();

            // Assert
            mockMessage.setup(instance => instance.replyCallback(It.IsAny())).returns(Promise.resolve<Message>(new Mock<Message>().object()))
        });

    });

    describe('Schedule Command (@Mention)', () => {
        let service: ScheduleCommand;
        let mockDataAccess: Mock<IDataAccess>;
        let mockMessage: Mock<MessageWrapper>;
        const mockEmployee: Employee = {
            DiscordId: '123',
            Name: 'Test',
            Email: null
        };

        const mockSchedule: Schedule =
        {
            days: [
                {
                    start: new Date(),
                    end: new Date()
                }
            ],
            employee: mockEmployee
        };

        beforeEach(() => {
            // Mock request
            mockMessage = new Mock<MessageWrapper>();
            mockMessage.setup(instance => instance.authorId).returns('123');
            mockMessage.setup(instance => instance.author).returns('Test');
            mockMessage.setup(instance => instance.replyCallback(It.IsAny())).returns(Promise.resolve<Message>(new Mock<Message>().object()));
            mockMessage.setup(instance => instance.findUser(It.IsAny())).returns(new Mock<User>().setup(instance => instance.id).returns('123456').object());

            mockDataAccess = new Mock<IDataAccess>();
            mockDataAccess.setup(instance => instance.getEmployee(It.IsAny())).returns(Promise.resolve<Employee>(mockEmployee));
            mockDataAccess.setup(instance => instance.addEmployee(It.IsAny())).returns(Promise.resolve());
            mockDataAccess.setup(instance => instance.getSchedule(It.IsAny<Employee[]>())).returns(Promise.resolve<Schedule>(mockSchedule));

            mockRequest = new Mock<DiscordRequest>();
            mockRequest.setup(instance => instance.args).returns(['<@!123456>']);
            mockRequest.setup(instance => instance.message).returns(mockMessage.object());
            mockRequest.setup(instance => instance.action).returns(MessageActionTypes.SCHEDULE);
            mockRequest.setup(instance => instance.dataAccess).returns(mockDataAccess.object());

            // Create service
            service = new ScheduleCommand(mockRequest.object());
        });

        it('should get all employees and schedules', async () => {
            // Arrange

            // Act
            await service.execute();

            // Assert
            mockDataAccess.verify(instance => instance.getEmployee(It.Is<string>(s => s === '123456')), Times.Exactly(1));
            mockDataAccess.verify(instance => instance.getSchedule(It.IsAny<Employee>()), Times.Exactly(1));
        });

        it('should reply', async () => {
            // Arrange

            // Act
            await service.execute();

            // Assert
            mockMessage.setup(instance => instance.replyCallback(It.IsAny())).returns(Promise.resolve<Message>(new Mock<Message>().object()))
        });

    });

    describe('Login Command', () => {
        let service: LoginCommand;
        let mockDataAccess: Mock<IDataAccess>;
        let mockMessage: Mock<MessageWrapper>;

        beforeEach(() => {
            // Mock request
            mockMessage = new Mock<MessageWrapper>();
            mockMessage.setup(instance => instance.authorId).returns('123');
            mockMessage.setup(instance => instance.author).returns('Test');
            mockMessage.setup(instance => instance.replyCallback(It.IsAny())).returns(Promise.resolve<Message>(new Mock<Message>().object()));

            mockDataAccess = new Mock<IDataAccess>();
            mockDataAccess.setup(instance => instance.recordLogin(It.IsAny())).returns(Promise.resolve());

            mockRequest = new Mock<DiscordRequest>();
            mockRequest.setup(instance => instance.message).returns(mockMessage.object());
            mockRequest.setup(instance => instance.action).returns(MessageActionTypes.LOGIN);
            mockRequest.setup(instance => instance.dataAccess).returns(mockDataAccess.object());

            // Create service
            service = new LoginCommand(mockRequest.object());
        });

        it('should call dataAccess once', async () => {
            // Arrange

            // Act
            await service.execute();

            // Assert
            mockDataAccess.verify(instance => instance.recordLogin(It.IsAny()), Times.Exactly(1));
        });

    });

    describe('Logout Command', () => {
        let service: LogoutCommand;
        let mockDataAccess: Mock<IDataAccess>;
        let mockMessage: Mock<MessageWrapper>;

        beforeEach(() => {
            // Mock request
            mockMessage = new Mock<MessageWrapper>();
            mockMessage.setup(instance => instance.authorId).returns('123');
            mockMessage.setup(instance => instance.author).returns('Test');
            mockMessage.setup(instance => instance.replyCallback(It.IsAny())).returns(Promise.resolve<Message>(new Mock<Message>().object()));

            mockDataAccess = new Mock<IDataAccess>();
            mockDataAccess.setup(instance => instance.recordLogout(It.IsAny())).returns(Promise.resolve());

            mockRequest = new Mock<DiscordRequest>();
            mockRequest.setup(instance => instance.message).returns(mockMessage.object());
            mockRequest.setup(instance => instance.action).returns(MessageActionTypes.LOGOUT);
            mockRequest.setup(instance => instance.dataAccess).returns(mockDataAccess.object());

            // Create service
            service = new LogoutCommand(mockRequest.object());
        });

        it('should call dataAccess once', async () => {
            // Arrange

            // Act
            await service.execute();

            // Assert
            mockDataAccess.verify(instance => instance.recordLogout(It.IsAny()), Times.Exactly(1));
        });

    });

});