import { DiscordRequestImpl } from "../models/discord-request";
import MessageWrapper from "../models/message-wrapper";
import { DiscordRequest, IDataAccess, MessageActionTypes, RequestProcessor } from "../types";
import { inject, injectable } from "tsyringe";

@injectable()
class RequestProcessorImpl implements RequestProcessor {

    /**
     * Creates a request processor
     * 
     * @param dataAccess {IDataAccess} the data access service
     */
    constructor(@inject('IDataAccess') private dataAccess: IDataAccess) {
                
    }

    public getRequest(message: MessageWrapper): DiscordRequest {
        if (!message.content.startsWith('!')) {
            console.debug('Ignoring non-bot message');
            return;
        }

        // Match on !abc123
        const matches = message.content.match(/(![a-z0-9]\w*)/ig);

        const words = message.content.split(' ');
        const matchIndex = words.findIndex(w => w === matches[0]);

        if (matchIndex === -1) {
            throw new Error('Unexpected action error.');
        }

        const args = words.slice(1, words.length);

        switch (matches[0].substr(1).toLowerCase()) {
            case 'schedule':
            case 'view':
                return new DiscordRequestImpl(message, MessageActionTypes.SCHEDULE, args, this.dataAccess);
            case 'authcode': {
                return new DiscordRequestImpl(message, MessageActionTypes.AUTH_CODE, args, this.dataAccess);
            }
            case 'login': {
                return new DiscordRequestImpl(message, MessageActionTypes.LOGIN, args, this.dataAccess);
            }
            case 'logout': {
                return new DiscordRequestImpl(message, MessageActionTypes.LOGOUT, args, this.dataAccess);
            }
            default:
                return null;
        }

    }

}

export default RequestProcessorImpl;