import { DiscordCommand, DiscordRequest } from "../../types";

/**
 * The login command
 */
class LoginCommand implements DiscordCommand {
    /**
     *
     */
    constructor(private request: DiscordRequest) {

    }

    public execute(): Promise<void> {
        return this.request.dataAccess.recordLogin(this.request.message.authorId);
    }
}

export default LoginCommand;