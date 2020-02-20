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

    public async execute(): Promise<void> {
        try {
            const dateObj = await this.request.dataAccess.recordLogout(this.request.message.authorId);
            this.request.message.replyCallback(`Successfully logged out at \`${dateObj.toLocaleString()}\``);
        } catch (err) {
            this.request.message.replyCallback((err as Error).message);
        }
    }
}

export default LogoutCommand;