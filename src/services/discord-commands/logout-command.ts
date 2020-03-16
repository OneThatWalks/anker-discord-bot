import { DiscordCommand, DiscordRequest, TimeClockRecord } from "../../types";
import { parseTimeFromArgs } from "../../util";

/**
 * The login command
 */
class LogoutCommand implements DiscordCommand {
    /**
     *
     */
    constructor(private request: DiscordRequest) { }

    public async execute(): Promise<void> {
        // Parse date from arguments
        // If this returns null default to now
        const date: Date = parseTimeFromArgs(this.request.args) ?? new Date();

        const buffer = new Date();
        buffer.setMinutes(buffer.getMinutes() + 7);

        if (date >= buffer) {
            this.request.message.replyCallback(`You may not specify a time more than 7 minutes in the future, please try again.`);
            return;
        }

        let lastClock: TimeClockRecord;
        try {
            lastClock = await this.request.dataAccess.lastClock(this.request.message.authorId);
        } catch (err) {
            console.error(err);
            await this.request.message.replyCallback('There was an issue logging out, please try again.\r\nIf this issue persists please let an administrator know.');
            return;
        }

        // Make sure a logout is allowed
        // Last clock should NOT have a logout date time
        if (!lastClock || lastClock.LogoutDateTimeUtc) {
            const previousClockInMessage = `Previous clock out detected at ${lastClock?.LogoutDateTimeUtc?.toLocaleString() ?? 'never'}.`;
            console.warn(`User [${this.request.message.authorId}], ${previousClockInMessage}`);
            await this.request.message.replyCallback(`There was an issue logging out.  ${previousClockInMessage}`);
            return;
        }

        // The current time argument should not occur before the last clock
        if (lastClock && (lastClock.LoginDateTimeUtc > date)) {
            const previousClockOutMessage = `Previous clock in detected at ${lastClock.LoginDateTimeUtc.toLocaleString()}, you may not logout before your last log in.`;
            console.warn(`User [${this.request.message.authorId}], ${previousClockOutMessage}`);
            await this.request.message.replyCallback(`There was an issue logging out.  ${previousClockOutMessage}`);
            return;
        }

        try {
            const dateObj = await this.request.dataAccess.recordLogout(this.request.message.authorId, date);
            this.request.message.replyCallback(`Successfully logged out at \`${dateObj.toLocaleString()}\``);
        } catch (err) {
            this.request.message.replyCallback((err as Error).message);
        }
    }
}

export default LogoutCommand;