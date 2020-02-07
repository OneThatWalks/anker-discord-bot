import { DiscordCommand, DiscordRequest, IScheduleRepo } from "../../typings";

/**
 * The authorize command
 */
class AuthorizeCommand implements DiscordCommand {
    /**
     *
     */
    constructor(private request: DiscordRequest, private scheduleRepo: IScheduleRepo) {

    }

    execute(): Promise<void> {
        return this.scheduleRepo.authorize(this.request.args[0]);
    }
}

export default AuthorizeCommand;