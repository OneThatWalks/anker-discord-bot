import { Mock, It, Times } from "moq.ts";
import { DiscordRequest, IDataAccess, MessageWrapper, MessageActionTypes } from "../src/types";
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
        mockMessage.setup(instance => instance.authorId).returns('123');
        mockMessage.setup(instance => instance.author).returns('Test');
        mockMessage.setup(instance => instance.replyCallback(It.IsAny())).returns(Promise.resolve<Message>(new Mock<Message>().object()));

        mockDataAccess = new Mock<IDataAccess>();
        mockDataAccess.setup(instance => instance.recordLogin(It.IsAny(), It.IsAny<Date>())).returns(Promise.resolve());

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
        date.setHours(date.getHours() + 1);
        mockRequest.setup(instance => instance.args).returns([`@${date.getHours()}`]);

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
        date.setHours(date.getHours() + 1);
        mockRequest.setup(instance => instance.args).returns([`@${date.getHours()}`]);

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
