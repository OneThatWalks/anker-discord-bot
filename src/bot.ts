import { Client, Message } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import DiscordCommander from './discord-commander';
import { AppConfig } from './models/app-config';
import AuthorizeCommand from './models/discord-commands/authorize-command';
import LoginCommand from './models/discord-commands/login-command';
import LogoutCommand from './models/discord-commands/logout-command';
import ScheduleCommand from "./models/discord-commands/schedule-command";
import MessageWrapper from './models/message-wrapper';
import RequestProcessorImpl from './request-processor';
import { DiscordCommand, DiscordInvoker, DiscordRequest, MessageActionTypes } from './types';

@injectable()
class Bot {

    public client: Client;

    constructor(@inject(AppConfig) private config: AppConfig,
        @inject("RequestProcessor") private requestProcessor: RequestProcessorImpl) {
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

                if (!request) {
                    console.debug('No action detected');
                    return;
                }

                // Instantiate commands for this request
                const authCommand: DiscordCommand = new AuthorizeCommand(request);
                const scheduleCommand: DiscordCommand = new ScheduleCommand(request);
                const loginCommand: DiscordCommand = new LoginCommand(request);
                const logoutCommand: DiscordCommand = new LogoutCommand(request);

                // The invoker of the commands
                // Doesn't need to know what each command does
                const commander: DiscordInvoker = new DiscordCommander(authCommand, scheduleCommand, loginCommand, logoutCommand);

                switch (request.action) {
                    case MessageActionTypes.AUTH_CODE: {
                        await commander.authorize();
                        break;
                    }
                    case MessageActionTypes.SCHEDULE: {
                        await commander.schedule();
                        break;
                    }
                    case MessageActionTypes.LOGIN: {
                        break;
                    }
                    case MessageActionTypes.LOGOUT: {
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