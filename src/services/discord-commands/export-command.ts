import { DiscordCommand, DiscordRequest } from "../../types";

/**
 * The export command
 */
class ExportCommand implements DiscordCommand {
    /**
     *
     */
    constructor(private request: DiscordRequest) {

    }

    execute(): Promise<void> {
        throw new Error('Method not implemented');
    }
}

export default ExportCommand;