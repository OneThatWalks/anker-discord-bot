import { DiscordCommand, DiscordRequest } from "../../typings";

/**
 * The authorize command
 */
class AuthorizeCommand implements DiscordCommand {
    /**
     *
     */
    constructor(private request: DiscordRequest) {

    }

    execute(): Promise<void> {
        return this.request.dataAccess.authorize(this.request.args[0]);
    }
}

export default AuthorizeCommand;