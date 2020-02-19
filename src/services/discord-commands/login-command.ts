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

    public async execute(): Promise<void> {
        try {
            await this.request.dataAccess.recordLogin(this.request.message.authorId);
        } catch (err) {
            this.request.message.replyCallback((err as Error).message);
        }
    }
}

export default LoginCommand;