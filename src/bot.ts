
import { Client, Message } from 'discord.js';
import MessageProcessor, { IMessageProcessor } from './message-processor';
import CommandExecutor, { ICommandExecutor } from './command-executor';

export interface IBot {
    
}

class Bot {

    public client: Client;
    private messageProcessor: IMessageProcessor;
    commandExecutor: ICommandExecutor;

    constructor(token: string) {
        this.messageProcessor = new MessageProcessor();
        this.commandExecutor = new CommandExecutor();
        this.registerClient(token);
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

                const commandContext = this.commandExecutor.execute(action);
                console.log(commandContext);

                if (commandContext.response) {
                    message.channel.send(commandContext.response);
                }
            }
        });
    }
}

export default Bot;