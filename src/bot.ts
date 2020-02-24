import { Client, Message } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { AppConfig } from './models/app-config';
import AuthorizeCommand from './services/discord-commands/authorize-command';
import LoginCommand from './services/discord-commands/login-command';
import LogoutCommand from './services/discord-commands/logout-command';
import ScheduleCommand from "./services/discord-commands/schedule-command";
import MessageWrapper from './models/message-wrapper';
import DiscordCommander from './services/discord-commander';
import RequestProcessorImpl from './services/request-processor';
import { DiscordCommand, DiscordInvoker, DiscordRequest, MessageActionTypes, DiscordClient } from './types';

@injectable()
class Bot {

    public client: Client;

    constructor(@inject(AppConfig) private config: AppConfig,
        @inject("RequestProcessor") private requestProcessor: RequestProcessorImpl,
        @inject("DiscordClient") private discordClient: DiscordClient) {
            this.registerClient();
    }

    registerClient(): void {
        this.discordClient.on('message', async (message: MessageWrapper) => {
            if (message.authorId !== this.discordClient.userId) {
                console.debug(`Processing message from ${message.author} Content: ${message.content}`);

                // Get the request for this message
                // Contains the message itself, the action and the args
                const request: DiscordRequest = this.requestProcessor.getRequest(message);

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
                        await commander.clockIn();
                        break;
                    }
                    case MessageActionTypes.LOGOUT: {
                        await commander.clockOut();
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