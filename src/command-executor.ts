import { MessageActionTypes } from "./message-processor";

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
     */
    constructor() {

    }

    execute(action: MessageActionTypes): CommandExecutorContext {
        const context = new CommandExecutorContext();
        context.action = action;

        switch (context.action) {
            case MessageActionTypes.SCHEDULE:
                // get schedule
                context.response = 'Some\r\nLines';
                break;
            default:
                break;
        }

        return context;
    }

}

export default CommandExecutor;