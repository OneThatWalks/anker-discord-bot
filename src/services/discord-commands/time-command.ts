import { DiscordCommand, DiscordRequest, TimeLoggedCriteria, TimeLoggedResult } from "../../types";
import { isTimeLoggedCriteria, formatSeconds } from "../../util";
import { User } from "discord.js";

class TimeCommand implements DiscordCommand {

    public constructor(private request: DiscordRequest) {

    }

    public async execute(): Promise<void> {
        // Find mentions if any
        const mentions = this.request.args?.filter((item: string) => item.startsWith('<@!') && item.endsWith('>')) ?? null;
        const mentionDiscordIds = mentions.map(m => m.slice(3, -1));

        // Track discordIds
        let discordIds: string[] = [this.request.message.authorId];
        // Push mentions
        if (mentions && mentions.length > 0) {
            discordIds = [...mentionDiscordIds];
        }

        // Identify time criteria if provided
        let timeLoggedCriteria: TimeLoggedCriteria = 'today';
        const timeArgumentIndex = this.request.args.findIndex(s => isTimeLoggedCriteria(s));

        if (timeArgumentIndex !== -1) {
            timeLoggedCriteria = this.request.args[timeArgumentIndex] as TimeLoggedCriteria;
        }

        let timeLogs: TimeLoggedResult[];

        // Gather logs
        try {
            timeLogs = await this.request.dataAccess.getTimeLogged(discordIds, timeLoggedCriteria);
        } catch (err) {
            console.error(err);
            // TODO: We can def put a request ID here for tracking
            this.request.message.replyCallback('I am having troubles getting time right now, please try again later.');
            return;
        }

        // Match non returned 
        const missingDiscords = discordIds.filter(val => timeLogs.findIndex(t => t.discordId === val) === -1);
        // Add as 0 time logged for criteria
        const emptyTimeLogs = missingDiscords.map(d => {
            return {
                criteria: timeLoggedCriteria,
                discordId: d,
                time: 0
            } as TimeLoggedResult;
        });
        // Update array
        timeLogs = [...timeLogs, ...emptyTimeLogs];

        // Anonymous username lookup
        const userFinder: (key: string) => string = (key: string): string => {
            const user: User = this.request.message.findUser(key) as User;
            return user?.username ?? 'unknown';
        };

        // Format reply
        const reply = timeLogs.map(l => `${userFinder(l.discordId)}'s time for [${l.criteria}]: ${formatSeconds(l.time)}.`);

        // Reply
        this.request.message.replyCallback(reply.join('\r\n'));
    }

}

export default TimeCommand;