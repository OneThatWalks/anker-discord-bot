import { Mock, It, Times } from "moq.ts";
import { DiscordRequest, IDataAccess, MessageWrapper, MessageActionTypes, TimeClockRecord } from "../src/types";
import { Message } from "discord.js";
import LoginCommand from "../src/services/discord-commands/login-command";
import LogoutCommand from "../src/services/discord-commands/logout-command";

describe('Login Command', () => {
    let mockRequest: Mock<DiscordRequest>;
    let service: LoginCommand;
    let mockDataAccess: Mock<IDataAccess>;
    let mockMessage: Mock<MessageWrapper>;

    beforeEach(() => {
        // Mock request
        mockMessage = new Mock<MessageWrapper>();
        mockMessage
            .setup(instance => instance.authorId)
            .returns('123');
        mockMessage
            .setup(instance => instance.author)
            .returns('Test');
        mockMessage
            .setup(instance => instance.replyCallback(It.IsAny()))
            .returns(Promise.resolve<Message>(new Mock<Message>().object()));

        mockDataAccess = new Mock<IDataAccess>();
        mockDataAccess
            .setup(instance => instance.lastClock(It.IsAny<string>()))
            .callback(({ args: [discordId] }) => {
                const start = new Date();
                const end = new Date();
                // Valid login occurs when last clock is fully filled out
                start.setMinutes(start.getMinutes() - 60);
                end.setMinutes(end.getMinutes() - 30);
                return Promise.resolve<TimeClockRecord>({
                    DiscordId: discordId,
                    LoginDateTimeUtc: start,
                    LogoutDateTimeUtc: end
                });
            });
        mockDataAccess
            .setup(instance => instance.recordLogin(It.IsAny(), It.IsAny<Date>()))
            .returns(Promise.resolve());

        mockRequest = new Mock<DiscordRequest>();
        mockRequest
            .setup(instance => instance.message)
            .returns(mockMessage.object());
        mockRequest
            .setup(instance => instance.action)
            .returns(MessageActionTypes.LOGIN);
        mockRequest
            .setup(instance => instance.dataAccess)
            .returns(mockDataAccess.object());

        // Create service
        service = new LoginCommand(mockRequest.object());
    });

    it('should call dataAccess once', async () => {
        // Arrange

        // Act
        await service.execute();

        // Assert
        mockDataAccess.verify(instance => instance.recordLogin(It.IsAny(), It.IsAny<Date>()), Times.Exactly(1));
    });

    it('should reply', async () => {
        // Arrange

        // Act
        await service.execute();

        // Assert
        mockMessage.verify(instance => instance.replyCallback(It.IsAny<string>()), Times.Once());
    });

    it('should not login when time param in future', async () => {
        // Arrange
        const date = new Date();
        date.setMinutes(date.getMinutes() + 21);
        mockRequest.setup(instance => instance.args).returns([`@${date.getHours()}:${date.getMinutes()}`]);

        // Act
        await service.execute();

        // Assert
        mockDataAccess.verify(instance => instance.recordLogin(It.IsAny<string>(), It.IsAny<Date>()), Times.Never());
        mockMessage.verify(instance => instance.replyCallback(It.Is<string>(s => s.includes('please try again'))), Times.Once());
    });

    it('should allow future login under 7 minutes in future', async () => {
        // Arrange
        const date = new Date();
        date.setMinutes(date.getMinutes() + 6);
        mockRequest.setup(instance => instance.args).returns([`@${date.getHours()}`]);

        // Act
        await service.execute();

        // Assert
        mockDataAccess.verify(instance => instance.recordLogin(It.IsAny<string>(), It.IsAny<Date>()), Times.Once());
    });

    it('should reply error when last clock fails', async () => {
        // Arrange
        mockDataAccess
            .setup(instance => instance.lastClock(It.IsAny<string>()))
            .returns(Promise.reject(new Error('Some test error')));

        // Act
        await service.execute();

        // Assert
        mockMessage.verify(instance => instance.replyCallback(It.Is<string>(s => s.includes('please try again'))), Times.Once());
        mockDataAccess.verify(instance => instance.recordLogin(It.IsAny<string>(), It.IsAny<Date>()), Times.Never());
    });

    it('should reply previous clock in when previous login detected', async () => {
        // Arrange
        mockDataAccess
            .setup(instance => instance.lastClock(It.IsAny<string>()))
            .callback(({ args: [discordId] }) => {
                const start = new Date();
                start.setMinutes(start.getMinutes() - 60);
                return Promise.resolve<TimeClockRecord>({
                    DiscordId: discordId,
                    LoginDateTimeUtc: start,
                    LogoutDateTimeUtc: undefined
                });
            });

        // Act
        await service.execute();

        // Assert
        mockMessage.verify(instance => instance.replyCallback(It.Is<string>(s => s.includes('Previous clock in detected'))), Times.Once());
        mockDataAccess.verify(instance => instance.recordLogin(It.IsAny<string>(), It.IsAny<Date>()), Times.Never());
});

    it('should reply error when login before last logout', async () => {
        // Arrange
        const date = new Date();
        date.setMinutes(date.getMinutes() - 35);
        mockRequest.setup(instance => instance.args).returns([`@${date.getHours()}`]);

        // Act
        await service.execute();

        // Assert
        mockMessage.verify(instance => instance.replyCallback(It.Is<string>(s => s.includes('There was an issue'))), Times.Once());
        mockDataAccess.verify(instance => instance.recordLogin(It.IsAny<string>(), It.IsAny<Date>()), Times.Never());
    });

});

describe('Logout Command', () => {
    let mockRequest: Mock<DiscordRequest>;
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
        mockDataAccess.setup(instance => instance.recordLogout(It.IsAny(), It.IsAny<Date>())).returns(Promise.resolve());

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
        mockDataAccess.verify(instance => instance.recordLogout(It.IsAny(), It.IsAny<Date>()), Times.Exactly(1));
    });

    it('should reply', async () => {
        // Arrange

        // Act
        await service.execute();

        // Assert
        mockMessage.verify(instance => instance.replyCallback(It.IsAny<string>()), Times.Once());
    });

    it('should not logout when time param in future', async () => {
        // Arrange
        const date = new Date();
        date.setMinutes(date.getMinutes() + 21);
        mockRequest.setup(instance => instance.args).returns([`@${date.getHours()}:${date.getMinutes()}`]);

        // Act
        await service.execute();

        // Assert
        mockDataAccess.verify(instance => instance.recordLogout(It.IsAny<string>(), It.IsAny<Date>()), Times.Never());
        mockMessage.verify(instance => instance.replyCallback(It.Is<string>(s => s.includes('please try again'))), Times.Once());
    });

    it('should allow future logout under 7 minutes in future', async () => {
        // Arrange
        const date = new Date();
        date.setMinutes(date.getMinutes() + 6);
        mockRequest.setup(instance => instance.args).returns([`@${date.getHours()}`]);

        // Act
        await service.execute();

        // Assert
        mockDataAccess.verify(instance => instance.recordLogout(It.IsAny<string>(), It.IsAny<Date>()), Times.Once());
    });

});
