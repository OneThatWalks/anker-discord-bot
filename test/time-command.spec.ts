import { DiscordCommand, DiscordRequest, IDataAccess } from "../src/types";
import TimeCommand from '../src/services/discord-commands/time-command';
import { Mock } from "moq.ts";

describe('Time Command', () => {

    let command: DiscordCommand;
    let mockRequest: Mock<DiscordRequest>;
    let mockDataAccess: Mock<IDataAccess>;

    beforeEach(() => {
        mockRequest = new Mock<DiscordRequest>();
        mockRequest.setup(instance => instance.dataAccess).returns(mockDataAccess.object());

        command = new TimeCommand(mockRequest.object());
    });

    it('should execute call employeeRepo for message author', () => {

    });

    it('should call employeeRepo for mention', () => {

    });

    it('should call timeClockRepo for \'today\'', () => {

    });

    it('should call timeClockRepo for \'yesterday\'', () => {

    });

    it('should call timeClockRepo for \'week\'', () => {

    });

    it('should call timeClockRepo for \'month\'', () => {

    });

    it('should call timeClockRepo for \'year\'', () => {

    });

    it('should call timeClockRepo for \'all\'', () => {

    });

});