import { DiscordCommand, DiscordRequest, Employee } from "../../types";
import { User } from "discord.js";

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

        if (this.request.args.length > 0) {

            if (this.request.args[0].toLowerCase() == 'all') {
                const employees: Employee[] = await this.request.dataAccess.getEmployees();

                const schedules = await this.request.dataAccess.getSchedules(...employees);

                const result = `\r\n${schedules.map(s => `${this.request.message.findUser(s.employee.DiscordId)}'s Schedule\r\n${s.toString()}`).join('\r\n')}`;

                this.request.message.replyCallback(result);
            } else {
                if (this.request.args[0].startsWith('<@') && this.request.args[0].endsWith('>')) {
                    // Is mention
                    let mention = this.request.args[0].slice(2, -1);

                    if (mention.startsWith('!')) {
                        mention = mention.slice(1);
                    }

                    const user: User = this.request.message.findUser(mention) as User;

                    if (!user) {
                        console.debug('Unrecognized mention');
                    }

                    const employee = await this.request.dataAccess.getEmployee(user.id);

                    const schedule = await this.request.dataAccess.getSchedules(employee);

                    this.request.message.replyCallback(`\r\n${user.username}'s Schedule\r\n` + schedule.toString());
                }
            }
        } else {
            const schedule = await this.request.dataAccess.getSchedules(initiatorEmployee);

            this.request.message.replyCallback(`Schedule:\r\n` + schedule.toString());
        }
    }
}

export default ScheduleCommand;