import { DiscordCommand, DiscordRequest, IDataAccess, Employee, MessageWrapper, TimeLoggedCriteria, TimeLoggedResult, TimeClockRecord } from "../src/types";
import ExportCommand from '../src/services/discord-commands/export-command';
import { Mock, It, Times } from "moq.ts";

describe('Export Command', () => {

    let command: DiscordCommand;
    let mockRequest: Mock<DiscordRequest>;
    let mockDataAccess: Mock<IDataAccess>;
    let mockMessageWrapper: Mock<MessageWrapper>;

    beforeEach(() => {
        mockMessageWrapper = new Mock<MessageWrapper>();
        mockMessageWrapper
            .setup(instance => instance.authorId)
            .returns('123');
        mockMessageWrapper
            .setup(instance => instance.replyCallback(It.IsAny()))
            .returns(Promise.resolve<MessageWrapper>(new Mock<MessageWrapper>().object()));
        mockMessageWrapper
            .setup(instance => instance.findUser(It.IsAny<string>()))
            .callback(({ args: [discordId] }) => { return { username: `Test-${discordId}` } });

        mockDataAccess = new Mock<IDataAccess>();
        mockDataAccess
            .setup(instance => instance.getPunches(It.IsAny<string[]>(), It.IsAny<TimeLoggedCriteria>()))
            .callback(async ({ args: [discordIds, criteria] }) => {
                return (discordIds as Array<string>).flatMap(id => {
                    const [start, end] = [new Date(), new Date()];

                    start.setHours(start.getHours() - 5);

                    return [{
                        DiscordId: id,
                        LoginDateTimeUtc: start,
                        LogoutDateTimeUtc: end
                    } as TimeClockRecord];
                });
            });
        mockDataAccess
            .setup(instance => instance.getEmployees())
            .returns(Promise.resolve<Employee[]>([
                {
                    Name: 'Test 1',
                    DiscordId: '123',
                    Email: 'test@test.com'
                },
                {
                    Name: 'Test 2',
                    DiscordId: '456',
                    Email: 'test2@test.com'
                },
                {
                    Name: 'Test 3',
                    DiscordId: '789',
                    Email: 'test3@test.com'
                }
            ]));

        mockRequest = new Mock<DiscordRequest>();
        mockRequest
            .setup(instance => instance.dataAccess)
            .returns(mockDataAccess.object());
        mockRequest
            .setup(instance => instance.message)
            .returns(mockMessageWrapper.object());
        mockRequest
            .setup(instance => instance.args)
            .returns([]);

        command = new ExportCommand(mockRequest.object());
    });

    it('should call employee repo for all employees', async () => {
        // Arrange

        // Act
        await command.execute();

        // Assert
        mockDataAccess
            .verify(instance => instance.getEmployees(), Times.Once());
    });

    it('should reply fail when employee repo fails', async () => {
        // Arrange
        mockDataAccess
            .setup(instance => instance.getEmployees())
            .returns(Promise.reject(new Error('Some test error')));

        // Act
        await command.execute();

        // Assert
        mockDataAccess
            .verify(instance => instance.getPunches(It.IsAny<string[]>(), It.IsAny<TimeLoggedCriteria>()), Times.Never());
        mockMessageWrapper
            .verify(instance => instance.replyCallback(It.Is<string>(s => s.includes('issue'))));
    });

    const criteria = [
        'today', 'yesterday', 'week', 'last-week', 'month',
        'last-month', 'year', 'last-year', 'all'
    ];

    criteria.forEach(c => {
        it(`should call time clock repo for [${c}]`, async () => {
            // Arrange
            mockRequest.setup(instance => instance.args).returns([c]);

            // Act
            await command.execute();

            // Assert
            mockDataAccess
                .verify(instance => instance.getPunches(It.IsAny<string>(), It.Is<TimeLoggedCriteria>(criteria => criteria === c)));
        });
    });

    it('should reply fail when time clock repo fails', async () => {
        // Arrange
        mockDataAccess
            .setup(instance => instance.getPunches(It.IsAny<string[]>(), It.IsAny<TimeLoggedCriteria>()))
            .returns(Promise.reject(new Error('Some test error')));

        // Act
        await command.execute();

        // Assert
        mockMessageWrapper
            .verify(instance => instance.replyCallback(It.Is<string>(s => s.includes('issue'))));
    });

    it('should reply', async () => {
        // Arrange

        // Act
        await command.execute();

        // Assert
        mockMessageWrapper
            .verify(instance => instance.replyCallback(It.IsAny<string>()));
    });
});