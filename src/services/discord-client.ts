import { AppConfig } from './../models/app-config';
import { DiscordClient } from "../types";
import { singleton, inject, injectable } from "tsyringe";
import { Client, Message } from 'discord.js';
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

        this.client = new Client();

        this.client.once('ready', () => {
            console.log('Discord Client Ready!');
        });

        this.client.login(appConfig.discord.token);

        this.client.on('message', (message: Message) => { this.emit('message', new MessageWrapper(message)) });
    }

    messageRoleUsers(role: string, msg: string | string[]): Promise<void> {
        throw new Error("Method not implemented.");
    }


}

export default DiscordClientImpl;