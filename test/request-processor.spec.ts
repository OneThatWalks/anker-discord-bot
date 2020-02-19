import 'reflect-metadata';
import RequestProcessorImpl from '../src/services/request-processor'
import { equal } from 'assert';
import { MessageActionTypes, IDataAccess } from '../src/types';
import MessageWrapper from '../src/models/message-wrapper';
import { container, DependencyContainer } from 'tsyringe';
import { Mock } from 'moq.ts';

describe('Request Processor', () => {
    let service: RequestProcessorImpl;
    let mockDataAccess: Mock<IDataAccess>;
    let childContainer: DependencyContainer;

    beforeEach(() => {
        // Create a child container for clean service and dependency mocking each time
        childContainer = container.createChildContainer();

        // Create mock dependencies
        mockDataAccess = new Mock<IDataAccess>();

        // Register mock dependencies to the container
        childContainer.registerInstance('IDataAccess', mockDataAccess.object())

        // Retrieve an instance of MyClass with a mock dependency
        service = childContainer.resolve(RequestProcessorImpl);
    });

    describe('getRequest()', () => {
        it('should return auth code request', () => {
            // Arrange
            const msg = new MessageWrapper();
            msg.content = '!authcode';

            // Act
            const result = service.getRequest(msg);

            // Assert
            equal(result.action, MessageActionTypes.AUTH_CODE);
        });

        it('should return schedule request', () => {
            // Arrange
            const msg = new MessageWrapper();
            msg.content = '!schedule';

            // Act
            const result = service.getRequest(msg);

            // Assert
            equal(result.action, MessageActionTypes.SCHEDULE);
        });

        it('should return schedule request 2', () => {
            // Arrange
            const msg = new MessageWrapper();
            msg.content = '!view';

            // Act
            const result = service.getRequest(msg);

            // Assert
            equal(result.action, MessageActionTypes.SCHEDULE);
        });

        it('should return login request', () => {
            // Arrange
            const msg = new MessageWrapper();
            msg.content = '!login';

            // Act
            const result = service.getRequest(msg);

            // Assert
            equal(result.action, MessageActionTypes.LOGIN);
        });

        it('should return logout request', () => {
            // Arrange
            const msg = new MessageWrapper();
            msg.content = '!logout';

            // Act
            const result = service.getRequest(msg);

            // Assert
            equal(result.action, MessageActionTypes.LOGOUT);
        });

        it('should return null', () => {
            // Arrange
            const msg = new MessageWrapper();
            msg.content = '!null';

            // Act
            const result = service.getRequest(msg);

            // Assert
            equal(result, null);
        });
    });
});