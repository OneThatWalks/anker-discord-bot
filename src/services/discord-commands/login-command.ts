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
        // TODO: Glean time from args
        // Variations noted
        // !login @7:37 AM
        // !login @8:03
        // !login @8:14am
        // !login @8:14p
        try {
            const dateObj = await this.request.dataAccess.recordLogin(this.request.message.authorId);
            this.request.message.replyCallback(`Successfully logged in at \`${dateObj.toLocaleString()}\``);
        } catch (err) {
            this.request.message.replyCallback((err as Error).message);
        }
    }
}

export default LoginCommand;