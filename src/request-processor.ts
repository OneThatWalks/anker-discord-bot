import { RequestProcessor, DiscordRequest, MessageActionTypes } from "./typings";
import { Message } from "discord.js";
import { DiscordRequestImpl } from "./discord-request";

class RequestProcessorImpl implements RequestProcessor {

    public getRequest(message: Message): DiscordRequest {
        if (!message.content.startsWith('!')) {
            console.log('Ignoring non-bot message');
            return;
        }

        // Match on !abc123
        const matches = message.content.match(/(![a-z0-9]\w*)/ig);
        console.log(matches);

        switch (matches[0].substr(1).toLowerCase()) {
            case 'schedule':
            case 'view':
                return null;
            case 'authcode': {
                const words = message.content.split(' ');
                const authCodeWordIndex = words.findIndex(w => w.toLowerCase() === '!authcode');

                if (authCodeWordIndex === -1) {
                    throw new Error('Unexpected action error.  Auth code action detected but no command exists in message.');
                }

                const args = words.slice(1, words.length);
                return new DiscordRequestImpl(message, MessageActionTypes.AUTH_CODE, args);
            }
            default:
                return null;
        }

    }

}

export default RequestProcessorImpl;