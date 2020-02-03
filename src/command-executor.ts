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
            default:
                break;
        }

        return context;
    }

}

export default CommandExecutor;