import { DiscordCommand, DiscordRequest } from "../../typings";

class ScheduleCommand implements DiscordCommand {
    /**
     * Creates a schedule command
     */
    constructor(private request: DiscordRequest) {
    }

    public async execute(): Promise<void> {
        const employee = await this.request.dataAccess.getEmployee(this.request.message.authorId);

        const schedule = this.request.dataAccess.getSchedule(employee);
    }
}

export default ScheduleCommand;