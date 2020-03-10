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

});


describe('Login/Logout time arguments', () => {

    // Test cases for parsing time between commands
    const testCases = [
        {
            it: 'should parse @7:37 AM',
            args: ['@7:37', 'AM'],
            expect: '7:37'
        },
        {
            it: 'should parse @8:03',
            args: ['@8:03'],
            expect: '8:03'
        },
        {
            it: 'should parse @8:14am',
            args: ['@8:14am'],
            expect: '8:14'
        },
        {
            it: 'should parse @8:14p',
            args: ['@8:14p'],
            expect: '20:14'
        },
        {
            it: 'should parse @8p',
            args: ['@8p'],
            expect: '20:00'
        },
        {
            it: 'should parse @4 PM',
            args: ['@4', 'PM'],
            expect: '16:00'
        }
    ];

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

        testCases.forEach((testCase) => {
            it(testCase.it, async () => {
                // Arrange
                mockRequest.setup(instance => instance.args).returns(testCase.args);

                // Act
                await service.execute();

                // Assert
                mockDataAccess.verify(instance => instance.recordLogout(It.IsAny(), It.Is<Date>(d => d.toString().includes(testCase.expect))));
            });

        });
    });
});