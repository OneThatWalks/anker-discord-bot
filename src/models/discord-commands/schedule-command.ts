import { DiscordCommand, DiscordRequest, Employee } from "../../types";

class ScheduleCommand implements DiscordCommand {
    /**
     * Creates a schedule command
     */
    constructor(private request: DiscordRequest) {
    }

    public async execute(): Promise<void> {
        const initiatorEmployee = await this.request.dataAccess.getEmployee(this.request.message.authorId);

        if (!initiatorEmployee) {
            const employee: Employee = {
                DiscordId: this.request.message.authorId,
                Name: this.request.message.author,
                Email: null
            };

            await this.request.dataAccess.addEmployee(employee);
        }

        switch (this.request.args[0]) {
            case null: {
                const schedule = await this.request.dataAccess.getSchedule(initiatorEmployee);

                this.request.message.replyCallback(`Schedule:\r\n` + schedule.toString());
                break;
            }
            case 'all': {
                const employees: Employee[] = await this.request.dataAccess.getEmployees();

                const schedules = await this.request.dataAccess.getSchedules(employees);

                const result = ``;

                this.request.message.replyCallback(result);

                break;
            }
            default: {
                if (this.request.args[0].startsWith('<@') && this.request.args[0].endsWith('>')) {
                    // Is mention
                    let mention = this.request.args[0].slice(2, -1);

                    if (mention.startsWith('!')) {
                        mention = mention.slice(1);
                    }

                    const user = this.request.message.message.client.users.get(mention);

                    if (!user) {
                        console.debug('Unrecognized mention');
                    }

                    const employee = await this.request.dataAccess.getEmployee(user.id);

                    const schedule = await this.request.dataAccess.getSchedule(employee);

                    this.request.message.replyCallback(`\r\n${user.username}'s Schedule\r\n` + schedule.toString());
                }

                break;
            }
        }


    }
}

export default ScheduleCommand;