import { Client, Message } from 'discord.js';
import { DiscordCommand, DiscordRequest, DiscordInvoker, MessageActionTypes, IScheduleRepo } from './typings';
import { inject, injectable } from 'tsyringe';
import { AppConfig } from './models/app-config';
import AuthorizeCommand from './models/discord-commands/authorize-command';
import DiscordCommander from './discord-commander';
import RequestProcessorImpl from './request-processor';

@injectable()
class Bot {

    public client: Client;

    constructor(@inject(AppConfig) private config: AppConfig,
        @inject("RequestProcessor") private requestProcessor: RequestProcessorImpl,
        @inject("IScheduleRepo") private scheduleRepo: IScheduleRepo) {
        this.registerClient(config.discord.token);
    }

    registerClient(token: string): void {
        this.client = new Client();

        this.client.once('ready', () => {
            console.log('Ready!');
        });

        this.client.login(token);

        this.client.on('message', async (message: Message) => {
            if (message.author !== this.client.user) {
                console.log(`Processing message from ${message.author.username} Content: ${message.content}`);

                // Get the request for this message
                // Contains the message itself, the action and the args
                const request: DiscordRequest = this.requestProcessor.getRequest(message);

                // Instantiate commands for this request
                const authCommand: DiscordCommand = new AuthorizeCommand(request, /* Receiver*/ this.scheduleRepo);

                // The invoker of the commands
                // Doesn't need to know what each command does
                const commander: DiscordInvoker = new DiscordCommander(authCommand);

                switch(request.action) {
                    case MessageActionTypes.AUTH_CODE: {
                        await commander.authorize();
                    }
                }
            }
        });
    }
}

export default Bot;