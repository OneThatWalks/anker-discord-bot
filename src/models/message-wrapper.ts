import { Message, MessageAdditions, MessageOptions, StringResolvable } from "discord.js";

/**
 * A message wrapper class
 * To make messages more unit testable
 */
class MessageWrapper {

    public content: string;
    public authorId: string;
    public author: string;
    public replyCallback: (content?: StringResolvable, options?: MessageOptions | MessageAdditions) => Promise<Message>;

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
            this.replyCallback = message.reply;
        }

    }
}

export default MessageWrapper;