import { DiscordCommand, DiscordInvoker } from '../types';

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
        private scheduleCommand: DiscordCommand,
        private loginCommand: DiscordCommand,
        private logoutCommand: DiscordCommand,
        private helpCommand: DiscordCommand,
        private timeCommand: DiscordCommand) {

    }

    authorize(): Promise<void> {
        return this.authorizeCommand.execute();
    }

    schedule(): Promise<void> {
        return this.scheduleCommand.execute();
    }

    clockIn(): Promise<void> {
        return this.loginCommand.execute();
    }

    clockOut(): Promise<void> {
        return this.logoutCommand.execute();
    }

    help(): Promise<void> {
        return this.helpCommand.execute();
    }

    time(): Promise<void> {
        return this.timeCommand.execute();
    }
}

export default DiscordCommander;