import { DiscordCommand, DiscordRequest, TimeLoggedCriteria, TimeLoggedResult } from "../../types";
import { isTimeLoggedCriteria } from "../../util";

class TimeCommand implements DiscordCommand {

    public constructor(private request: DiscordRequest) {

    }

    public async execute(): Promise<void> {
        // Find mentions if any
        const mentions = this.request.args?.filter((item: string) => item.startsWith('<@!') && item.endsWith('>')) ?? null;
        
        // Track discordIds
        let discordIds: string[] = [this.request.message.authorId];
        // Push mentions
        if (mentions && mentions.length > 0) {
            discordIds = [...discordIds, ...mentions];
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
            console.log(err);
            // TODO: We can def put a request ID here for tracking
            this.request.message.replyCallback('I am having troubles getting time right now, please try again later.');
            return;
        }

        // Format reply
        const reply = timeLogs.map(l => `\r\n${l.discordId}'s time for [${l.criteria}]: ${l.time} hours.`);

        // Reply
        this.request.message.replyCallback(reply);
    }

}

export default TimeCommand;