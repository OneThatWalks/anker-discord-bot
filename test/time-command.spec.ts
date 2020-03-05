import { DiscordCommand, DiscordRequest, IDataAccess, Employee, MessageWrapper, TimeLoggedCriteria, TimeLoggedResult } from "../src/types";
import TimeCommand from '../src/services/discord-commands/time-command';
import { Mock, It, Times } from "moq.ts";

describe('Time Command', () => {

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
            .setup(instance => instance.getTimeLogged(It.IsAny<string[]>(), It.IsAny<TimeLoggedCriteria>()))
            .callback(({ args: [discordIds, criteria] }) => {
                return (discordIds as Array<string>).map(id => {
                    return {
                        criteria: criteria,
                        discordId: id,
                        time: 4
                    } as TimeLoggedResult;
                });
            });

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

        command = new TimeCommand(mockRequest.object());
    });

    it('should call getTimeLogged with one discordId', async () => {
        // Arrange

        // Act
        await command.execute();

        // Assert
        mockDataAccess.verify(instance =>
            instance.getTimeLogged(It.Is<Array<string>>(s => s.length === 1), It.IsAny()), Times.Once());
    });

    it('should call getTimeLogged with two discordIds', async () => {
        // Arrange
        mockRequest.setup(instance => instance.args).returns(['<@!456>', '<@!789>']);

        // Act
        await command.execute();

        // Assert
        mockDataAccess.verify(instance =>
            instance.getTimeLogged(It.Is<Array<string>>(s => s.length === 2), It.IsAny()), Times.Once());
    });

    it('should call timeClockRepo for \'today\'', async () => {
        // Arrange

        // Act
        await command.execute();

        // Assert
        mockDataAccess
            .verify(instance => instance.getTimeLogged(It.Is<string[]>(sa => sa[0] === '123'), It.Is<TimeLoggedCriteria>(t => t === 'today')));
    });

    it('should call timeClockRepo for \'yesterday\'', async () => {
        // Arrange
        mockRequest
            .setup(instance => instance.args)
            .returns(['yesterday']);

        // Act
        await command.execute();

        // Assert
        mockDataAccess
            .verify(instance =>
                instance.getTimeLogged(It.Is<string[]>(sa => sa[0] === '123'),
                    It.Is<TimeLoggedCriteria>(t => t === 'yesterday')));
    });

    it('should call timeClockRepo for \'week\'', async () => {
        // Arrange
        mockRequest
            .setup(instance => instance.args)
            .returns(['week']);

        // Act
        await command.execute();

        // Assert
        mockDataAccess
            .verify(instance =>
                instance.getTimeLogged(It.Is<string[]>(sa => sa[0] === '123'),
                    It.Is<TimeLoggedCriteria>(t => t === 'week')));
    });

    it('should call timeClockRepo for \'month\'', async () => {
        // Arrange
        mockRequest
            .setup(instance => instance.args)
            .returns(['month']);

        // Act
        await command.execute();

        // Assert
        mockDataAccess
            .verify(instance =>
                instance.getTimeLogged(It.Is<string[]>(sa => sa[0] === '123'),
                    It.Is<TimeLoggedCriteria>(t => t === 'month')));
    });

    it('should call timeClockRepo for \'year\'', async () => {
        // Arrange
        mockRequest
            .setup(instance => instance.args)
            .returns(['year']);

        // Act
        await command.execute();

        // Assert
        mockDataAccess
            .verify(instance =>
                instance.getTimeLogged(It.Is<string[]>(sa => sa[0] === '123'),
                    It.Is<TimeLoggedCriteria>(t => t === 'year')));
    });

    it('should call timeClockRepo for \'all\'', async () => {
        // Arrange
        mockRequest
            .setup(instance => instance.args)
            .returns(['all']);

        // Act
        await command.execute();

        // Assert
        mockDataAccess
            .verify(instance =>
                instance.getTimeLogged(It.Is<string[]>(sa => sa[0] === '123'),
                    It.Is<TimeLoggedCriteria>(t => t === 'all')));
    });

    it('should reply', async () => {
        // Arrange

        // Act
        await command.execute();

        // Assert
        mockMessageWrapper.verify(instance => instance.replyCallback(It.IsAny()), Times.Once());
    });

    it('should reply when dal fails', async () => {
        // Arrange
        mockDataAccess.setup(instance => instance.getTimeLogged(It.IsAny<string[]>(), It.IsAny<TimeLoggedCriteria>())).throws(new Error('Some test error'));

        // Act
        await command.execute();

        // Assert
        mockMessageWrapper.verify(instance => instance.replyCallback(It.Is<string>(s => s.includes('having troubles'))), Times.Once());
    });

    it('should reply no time when no time', async () => {
        // Arrange
        mockDataAccess
            .setup(instance => instance.getTimeLogged(It.IsAny<string[]>(), It.IsAny<TimeLoggedCriteria>()))
            .returns([]);

        // Act
        await command.execute();

        // Assert
        mockMessageWrapper.verify(instance => instance.replyCallback(It.Is<string>(s => s.includes('0 hours'))), Times.Once());
    });

    it('should call for user info when replying', async () => {
        // Arrange

        // Act
        await command.execute();

        // Assert
        mockMessageWrapper.verify(instance => instance.replyCallback(It.Is<string>(s => s.includes('Test-123\'s time'))), Times.Once());
    });

    it('should reply only for different mention', async () => {
        // Arrange
        mockRequest.setup(instance => instance.args).returns(['<@!456>']);

        // Act
        await command.execute();

        // Assert
        mockMessageWrapper.verify(instance => instance.replyCallback(It.Is<string>(s => s.includes('Test-456\'s time') && !s.includes('Test-123\'s time'))), Times.Once());
    });

});