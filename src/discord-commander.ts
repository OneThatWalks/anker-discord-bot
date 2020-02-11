import { DiscordInvoker, DiscordCommand } from "./typings";

/**
 * The discord command invoker
 * 
 * @remarks The command invoker does not need to know what each command does to decouple requests from the client
 */
class DiscordCommander implements DiscordInvoker {

    /**
     * Creates an invoker of the anker discord commands
     * 
     * @param authorizeCommand {DiscordCommand} The authorize code command
     */
    constructor(private authorizeCommand: DiscordCommand,
        private scheduleCommand: DiscordCommand) {

    }

    authorize(): Promise<void> {
        return this.authorizeCommand.execute();
    }

    schedule(): Promise<void> {
        return this.scheduleCommand.execute();
    }

    clockIn(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    clockOut(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default DiscordCommander;