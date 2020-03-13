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

            \`!login @8:00 AM\`
            Clocks you in at 8 AM

            \`!logout\`
            Clocks you out at the time sent

            \`!logout @8:00 AM\`
            Clocks you out at 8 AM

            *Note: you may not login/logout more than 7 minutes in the future*

            \`!time\`
            Gets your hours logged for today

            \`!time @Mention\`
            Gets specified user's hours logged for today

            \`!time [today | yesterday | week | month | year | all]\`
            Gets your hours logged for specified criteria

            \`!export\`
            Gets all logged time for last month and exports it as a csv

            \`!export [today | yesterday | week | last-week | month | last-month | year | last-year | all]\`
            Gets all logged time for the specified criteria and exports it as a csv
            `
        );
    }
}

export default HelpCommand;