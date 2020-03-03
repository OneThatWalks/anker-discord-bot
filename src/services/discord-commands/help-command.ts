import { DiscordCommand, DiscordRequest } from "../../types";

/**
 * The login command
 */
class HelpCommand implements DiscordCommand {
    /**
     *
     */
    constructor(private request: DiscordRequest) {

    }

    public async execute(): Promise<void> {
        this.request.message.replyCallback(
            `Available commands:
            \`!schedule\`
            Sends you your schedule for the next 7 days
            
            \`!schedule all\`
            Sends you every employee's schedule for the next 7 days

            \`!schedule @Mention\`
            Sends you a specified user's schedule for the next 7 days

            \`!login\`
            Clocks you in at the time sent

            \`!logout\`
            Clocks you out at the time sent

            \`!time\`
            Gets your hours logged for today

            \`!time @Mention\`
            Gets specified user's hours logged for today

            \`!time [today | yesterday | week | month | year | all]\`
            Gets your hours logged for specified criteria
            `
        );
    }
}

export default HelpCommand;