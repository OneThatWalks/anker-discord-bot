import { Client, Message } from 'discord.js';
import DataAccess from './data-access/data-access';
import { IMessageProcessor, ICommandExecutor, CommandExecutorContext } from '../typings';
import MessageProcessor from './message-processor';
import CommandExecutor from './command-executor';

class Bot {

    public client: Client;
    private messageProcessor: IMessageProcessor;
    commandExecutor: ICommandExecutor;

    constructor(token: string, dbPath: string, scheduleRepoClientId: string, scheduleRepoClientSecret: string, redirectUrl: string) {
        const da = new DataAccess({databasePath: dbPath, scheduleRepo: {
            clientId: scheduleRepoClientId,
            clientSecret: scheduleRepoClientSecret,
            redirectUrls: [redirectUrl]
        }});
        this.messageProcessor = new MessageProcessor();
        this.commandExecutor = new CommandExecutor(da);
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

                var commandContext: CommandExecutorContext = {
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