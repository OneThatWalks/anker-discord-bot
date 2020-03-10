import { DiscordCommand, DiscordRequest } from "../../types";

/**
 * The login command
 */
class LogoutCommand implements DiscordCommand {
    /**
     *
     */
    constructor(private request: DiscordRequest) { }

    public async execute(): Promise<void> {
        const date: Date = new Date();
        // Command expects (optional) additional argument preceded with '@'
        const timeArg = this.request.args?.filter((item: string) => item.startsWith('@')) ?? null;
        if (timeArg) {
            const time = timeArg[0].slice(1).split(':');
            let hour, minute, ampm;

            if (time?.length > 0) {
                // Probably just an hour

                // Separate numbers from characters
                const num = time[0].match(/\d+/);
                const str = time[0].match(/[AaPp][Mm]|[Aa]|[Pp]/g);

                // Set am/pm if exists
                if (str?.length > 0) {
                    ampm = str[0];
                }

                // Parse hour number
                if (num?.length > 0) {
                    hour = parseInt(num[0], 10);
                }
            }

            // Minute param
            if (time?.length > 1) {

                // Separate numbers from characters
                const num = time[1].match(/\d+/);
                const str = time[1].match(/[AaPp][Mm]|[Aa]|[Pp]/g);

                // Set am/pm if exists
                // Overwrite if needed since am/pm usually exists after the hour
                if (str?.length > 0) {
                    ampm = str[0];
                }
                // Parse minute number
                if (num?.length > 0) {
                    minute = parseInt(num[0], 10);
                }
            }

            if (!ampm) {
                const afterTimeArgIndex = this.request.args.indexOf(timeArg[0]) + 1;
                if (afterTimeArgIndex < this.request.args.length) {
                    const argAfterTime = this.request.args[afterTimeArgIndex];

                    const str = argAfterTime.match(/[AaPp][Mm]|[Aa]|[Pp]/);

                    if (str?.length > 0) {
                        ampm = str[0];
                    }
                }
            }

            if (hour) {
                let dateHours = hour;
                if (ampm) {
                    if (ampm.match(/[Pp][Mm]|[Pp]/)?.length > 0) {
                        dateHours += 12;
                    }
                }

                date.setHours(dateHours);
                date.setMinutes(0);
                date.setSeconds(0);
            }

            if (minute) {
                date.setMinutes(minute);
            }
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