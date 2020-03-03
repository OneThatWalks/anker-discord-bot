import { Message, User, StringResolvable, MessageOptions, MessageEmbed, MessageAttachment } from "discord.js";
import { MessageWrapper } from "../types";

/**
 * A message wrapper class
 * To make messages more unit testable
 */
class MessageWrapperImpl implements MessageWrapper {

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

    public async replyCallback(content?: StringResolvable, options?: MessageOptions | MessageEmbed | MessageAttachment | (MessageEmbed | MessageAttachment)[]): Promise<MessageWrapperImpl> {
        const msg = await this.message.reply(content, options);
        const wrp = new MessageWrapperImpl(msg);
        return wrp;
    }

    public findUser(key: string): User {
        return this.message.client.users.cache.get(key);
    }
}

export default MessageWrapperImpl;