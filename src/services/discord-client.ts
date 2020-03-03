import { AppConfig } from './../models/app-config';
import { DiscordClient } from "../types";
import { singleton, inject, injectable } from "tsyringe";
import { Client, Message, GuildChannel, TextChannel } from 'discord.js';
import { EventEmitter } from 'events';
import MessageWrapper from '../models/message-wrapper';

@singleton()
@injectable()
class DiscordClientImpl extends EventEmitter implements DiscordClient {

    private client: Client;

    /**
     * Creates an instance of the discord client
     */
    constructor(@inject(AppConfig) private appConfig: AppConfig) {
        super();


        // Init discord client
        this.client = new Client();

        // Register ready handler
        this.client.once('ready', () => {
            console.log('Discord Client Ready!');
        });

        // Login
        this.client.login(appConfig.discord.token);

        // Register message handler
        this.client.on('message', (message: Message) => { this.emit('message', new MessageWrapper(message)) });
    }

    public async messageChannel(channel: string, msg: string | string[]): Promise<void> {
        try {
            const defaultGuild = this.client.guilds.cache.get(this.appConfig.discord.defaultGuildId);
            const defaultGuildChannel: GuildChannel = defaultGuild.channels.cache.find(ch => ch.name === channel);
    
            // Typeguard text channel
            if (!((defaultGuildChannel): defaultGuildChannel is TextChannel => defaultGuildChannel.type === 'text')(defaultGuildChannel)) return;
    
            await defaultGuildChannel.send(msg);
        } catch (err) {
            console.error(err);
        }
    }

    public get userId(): string {
        return this.client.user.id;
    }
}

export default DiscordClientImpl;