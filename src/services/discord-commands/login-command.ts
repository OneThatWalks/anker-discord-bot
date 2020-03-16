import { DiscordCommand, DiscordRequest, TimeClockRecord } from "../../types";
import { parseTimeFromArgs } from "../../util";
import { isNullOrUndefined } from "util";

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

        const buffer = new Date();
        buffer.setMinutes(buffer.getMinutes() + 7);

        if (date >= buffer) {
            await this.request.message.replyCallback(`You may not specify a time more than 7 minutes in the future, please try again.`);
            return;
        }

        let lastClock: TimeClockRecord;
        try {
            lastClock = await this.request.dataAccess.lastClock(this.request.message.authorId);
        } catch (err) {
            console.error(err);
            await this.request.message.replyCallback('There was an issue logging in, please try again.\r\nIf this issue persists please let an administrator know.');
            return;
        }

        // Make sure a login is allowed
        // Last clock should have a logout date time
        if (lastClock && isNullOrUndefined(lastClock.LogoutDateTimeUtc)) {
            const previousClockInMessage = `Previous clock in detected at ${lastClock.LoginDateTimeUtc.toLocaleString()}.`;
            console.warn(`User [${this.request.message.authorId}], ${previousClockInMessage}`);
            await this.request.message.replyCallback(`There was an issue logging in.  ${previousClockInMessage}`);
            return;
        }

        // The current time argument should not occur before the last clock
        if (lastClock && (lastClock.LogoutDateTimeUtc > date)) {
            const previousClockOutMessage = `Previous clock out detected at ${lastClock.LogoutDateTimeUtc.toLocaleString()}, you may not login before your last log out.`;
            console.warn(`User [${this.request.message.authorId}], ${previousClockOutMessage}`);
            await this.request.message.replyCallback(`There was an issue logging in.  ${previousClockOutMessage}`);
            return;
        }

        try {
            const dateObj = await this.request.dataAccess.recordLogin(this.request.message.authorId, date);
            await this.request.message.replyCallback(`Successfully logged in at \`${dateObj.toLocaleString()}\``);
        } catch (err) {
            await this.request.message.replyCallback((err as Error).message);
        }
    }
}

export default LoginCommand;