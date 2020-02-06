import { Client, Message } from 'discord.js';
import { IMessageProcessor, ICommandExecutor, CommandExecutorContext } from '../typings';
import { inject, injectable } from 'tsyringe';
import { AppConfig } from './models/app-config';

@injectable()
class Bot {

    public client: Client;

    constructor(@inject(AppConfig) private config: AppConfig,
        @inject("IMessageProcessor") private messageProcessor: IMessageProcessor,
        @inject("ICommandExecutor") private commandExecutor: ICommandExecutor) {
        this.registerClient(config.discord.token);
    }

    registerClient(token: string): void {
        this.client = new Client();

        this.client.once('ready', () => {
            console.log('Ready!');
        });

        this.client.login(token);

        this.client.on('message', (message: Message) => {
            if (message.author !== this.client.user) {
                console.log(`Processing message from ${message.author.username} Content: ${message.content}`);

                const action = this.messageProcessor.process(message.content);
                console.log(action);

                const commandContext: CommandExecutorContext = {
                    action: action,
                    clientMessage: message,
                    response: null
                };

                this.commandExecutor.execute(commandContext);
                console.log(commandContext);

                if (commandContext.response) {
                    message.channel.send(commandContext.response);
                }
            }
        });
    }
}

export default Bot;