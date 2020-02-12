import { Client, Message } from 'discord.js';
import { DiscordCommand, DiscordRequest, DiscordInvoker, MessageActionTypes, IScheduleRepo } from './types';
import { inject, injectable } from 'tsyringe';
import { AppConfig } from './models/app-config';
import AuthorizeCommand from './models/discord-commands/authorize-command';
import ScheduleCommand from "./models/discord-commands/schedule-command";
import DiscordCommander from './discord-commander';
import RequestProcessorImpl from './request-processor';
import MessageWrapper from './models/message-wrapper';

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
                console.debug(`Processing message from ${message.author.username} Content: ${message.content}`);

                const msg = new MessageWrapper(message);

                // Get the request for this message
                // Contains the message itself, the action and the args
                const request: DiscordRequest = this.requestProcessor.getRequest(msg);

                // Instantiate commands for this request
                const authCommand: DiscordCommand = new AuthorizeCommand(request);
                const scheduleCommand: DiscordCommand = new ScheduleCommand(request);

                // The invoker of the commands
                // Doesn't need to know what each command does
                const commander: DiscordInvoker = new DiscordCommander(authCommand, scheduleCommand);

                switch(request.action) {
                    case MessageActionTypes.AUTH_CODE: {
                        await commander.authorize();
                        break;
                    }
                    case MessageActionTypes.SCHEDULE: {
                        await commander.schedule();
                        break;
                    }
                    default:
                        break;
                }
            }
        });
    }
}

export default Bot;