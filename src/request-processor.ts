import { RequestProcessor, DiscordRequest, MessageActionTypes } from "./typings";
import { Message } from "discord.js";
import { DiscordRequestImpl } from "./discord-request";

class RequestProcessorImpl implements RequestProcessor {

    public getRequest(message: Message): DiscordRequest {
        if (!message.content.startsWith('!')) {
            console.debug('Ignoring non-bot message');
            return;
        }

        // Match on !abc123
        const matches = message.content.match(/(![a-z0-9]\w*)/ig);

        const words = message.content.split(' ');
        const matchIndex = words.findIndex(w => w === matches[0]);

        if (matchIndex === -1) {
            throw new Error('Unexpected action error.  Auth code action detected but no command exists in message.');
        }

        const args = words.slice(1, words.length);

        switch (matches[0].substr(1).toLowerCase()) {
            case 'schedule':
            case 'view':
                return new DiscordRequestImpl(message, MessageActionTypes.SCHEDULE, args);
            case 'authcode': {
                return new DiscordRequestImpl(message, MessageActionTypes.AUTH_CODE, args);
            }
            default:
                return null;
        }

    }

}

export default RequestProcessorImpl;