import 'reflect-metadata';
import AuthorizeCommand from '../src/models/discord-commands/authorize-command'
import { equal } from 'assert';
import { DiscordRequest, IDataAccess, MessageActionTypes } from '../src/typings';
import { Mock, It, Times } from 'moq.ts';

describe('Commands', () => {
    let mockRequest: Mock<DiscordRequest>;

    describe('Authorize Command', () => {
        let service: AuthorizeCommand;
        let mockDataAccess: Mock<IDataAccess>;

        beforeEach(() => {
            // Mock request
            mockRequest = new Mock<DiscordRequest>();
            mockDataAccess = new Mock<IDataAccess>()
            mockDataAccess.setup(instance => instance.authorize(It.IsAny())).returns(new Promise((res, rej) => res()));
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

});