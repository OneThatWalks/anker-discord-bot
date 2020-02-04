import { ICommandExecutor, IDataAccess, CommandExecutorContext, MessageActionTypes } from '../typings';


class CommandExecutor implements ICommandExecutor {
    /**
     * Creates a command executor
     * 
     * @param dataAccess {IDataAccess} The data access service
     */
    constructor(private dataAccess: IDataAccess) {

    }

    execute(context: CommandExecutorContext): CommandExecutorContext {

        switch (context.action) {
            case MessageActionTypes.SCHEDULE:
                // get schedule
                this.dataAccess.getEmployee(context.clientMessage.author.id).then(async (em) => {
                    if (em == null) {
                        em = {
                            DiscordId: context.clientMessage.author.id,
                            Name: context.clientMessage.author.username
                        };
                        await this.dataAccess.addEmployee(em);
                    }

                    const schedule = this.dataAccess.getSchedule(em);
                }).catch((err) => {
                    throw err;
                });
                break;
            case MessageActionTypes.AUTH_CODE:
                const words = context.clientMessage.content.split(' ');
                const authCodeWordIndex = words.findIndex(w => w.toLowerCase() === '!authcode');

                if (authCodeWordIndex === -1) {
                    throw new Error('Unexpected action error.  Auth code action detected but no command exists in message.');
                }

                const code = words[authCodeWordIndex + 1];

                this.dataAccess.authorize(code);
                break;
            default:
                break;
        }

        return context;
    }

}

export default CommandExecutor;