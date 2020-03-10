import { DiscordCommand, DiscordRequest } from "../../types";
import { parseTimeFromArgs } from "../../util";

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
        // Parse date from arguments
        // If this returns null default to now
        const date: Date = parseTimeFromArgs(this.request.args) ?? new Date();
        
        try {
            const dateObj = await this.request.dataAccess.recordLogin(this.request.message.authorId, date);
            this.request.message.replyCallback(`Successfully logged in at \`${dateObj.toLocaleString()}\``);
        } catch (err) {
            this.request.message.replyCallback((err as Error).message);
        }
    }
}

export default LoginCommand;