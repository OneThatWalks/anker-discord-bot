import { DiscordCommand, DiscordRequest, Employee } from "../../types";

class ScheduleCommand implements DiscordCommand {
    /**
     * Creates a schedule command
     */
    constructor(private request: DiscordRequest) {
    }

    public async execute(): Promise<void> {
        const employee = await this.request.dataAccess.getEmployee(this.request.message.authorId);

        if (!employee) {
            const employee: Employee = {
                DiscordId: this.request.message.authorId,
                Name: this.request.message.author,
                Email: null
            };

            await this.request.dataAccess.addEmployee(employee);
        }

        const schedule = await this.request.dataAccess.getSchedule(employee);

        this.request.message.replyCallback(schedule.toString());
    }
}

export default ScheduleCommand;