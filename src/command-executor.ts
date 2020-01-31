import { MessageActionTypes } from "./message-processor";
import { IDataAccess, Employee } from "./data-access";

export interface ICommandExecutor {
    execute(action: MessageActionTypes): CommandExecutorContext;
}

export class CommandExecutorContext {
    action: MessageActionTypes;
    response: string;
    // Future work clock
    // responses: string[]
}

class CommandExecutor implements ICommandExecutor {
    /**
     * Creates a command executor
     * 
     * @param dataAccess The data access service
     */
    constructor(private dataAccess: IDataAccess) {

    }

    execute(action: MessageActionTypes): CommandExecutorContext {
        const context = new CommandExecutorContext();
        context.action = action;

        switch (context.action) {
            case MessageActionTypes.SCHEDULE:
                // get schedule
                const em: Employee = {
                    Name: 'Test',
                    DiscordId: '123'
                };
                this.dataAccess.addEmployee(em);
                context.response = '';
                break;
            default:
                break;
        }

        return context;
    }

}

export default CommandExecutor;