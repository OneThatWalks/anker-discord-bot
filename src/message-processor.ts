import { IMessageProcessor, MessageActionTypes } from '../typings';

class MessageProcessor implements IMessageProcessor {

    public process(message: string): MessageActionTypes {

        if (!message.startsWith('!')) {
            console.log('Ignoring non-bot message');
            return;
        }

        // Match on !abc123
        const matches = message.match(/(![a-z0-9]\w*)/ig);
        console.log(matches);

        // Returning only one action per message right now
        // Ex: We can do !this
        // Not !this and !this
        return this.getMessageAction(matches[0]);
    }

    /**
     * 
     * @param content The message content
     */
    private getMessageAction(content: string): MessageActionTypes {
        // Trim ! off of command
        const command = content.substr(1).toLowerCase();

        switch (command) {
            case 'schedule':
            case 'view':
                return MessageActionTypes.SCHEDULE;
            case 'authcode':
                return MessageActionTypes.AUTH_CODE;
            default:
                return MessageActionTypes.NONE;
        }
    }

}

export default MessageProcessor;