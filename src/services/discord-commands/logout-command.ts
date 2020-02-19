import { DiscordCommand, DiscordRequest } from "../../types";

/**
 * The login command
 */
class LogoutCommand implements DiscordCommand {
    /**
     *
     */
    constructor(private request: DiscordRequest) {

    }

    public execute(): Promise<void> {
        return this.request.dataAccess.recordLogout(this.request.message.authorId);
    }
}

export default LogoutCommand;