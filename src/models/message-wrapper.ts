import { Message, MessageAdditions, MessageOptions, StringResolvable } from "discord.js";

/**
 * A message wrapper class
 * To make messages more unit testable
 */
class MessageWrapper {

    public content: string;
    public authorId: string;
    public author: string;

    /**
     * Creates a message wrapper object
     * 
     * @remarks Parameter-less constructor for testing
     */
    constructor(public message?: Message) {
        if (message) {
            this.content = message.content;
            this.authorId = message.author.id;
            this.author = message.author.username;
        }
    }

    
    public replyCallback (content?: StringResolvable, options?: MessageOptions | MessageAdditions): Promise<Message> {
        return this.message.reply(content, options);
    }
}

export default MessageWrapper;