import { DiscordCommand, DiscordRequest, Employee, TimeClockRecord, TimeLoggedCriteria } from "../../types";
import { isTimeLoggedCriteria } from "../../util";

/**
 * The export command
 */
class ExportCommand implements DiscordCommand {
    /**
     *
     */
    constructor(private request: DiscordRequest) {

    }

    async execute(): Promise<void> {
        let employees: Employee[];
        try {
            employees = await this.request.dataAccess.getEmployees();
        } catch (err) {
            console.log(err);
            await this.request.message.replyCallback('There was an issue completing your request.  Please try again later.\r\nIf this issue persists let an administrator know.');
            return;
        }

        // Identify time criteria if provided
        let timeLoggedCriteria: TimeLoggedCriteria = 'last-month';
        const timeArgumentIndex = this.request.args.findIndex(s => isTimeLoggedCriteria(s));

        if (timeArgumentIndex !== -1) {
            timeLoggedCriteria = this.request.args[timeArgumentIndex] as TimeLoggedCriteria;
        }

        let punches: TimeClockRecord[];

        try {
            punches = await this.request.dataAccess.getPunches(employees.map(e => e.DiscordId), timeLoggedCriteria);
        } catch (err) {
            console.log(err);
            await this.request.message.replyCallback('There was an issue completing your request.  Please try again later.\r\nIf this issue persists let an administrator know.');
            return;
        }

        await this.request.message.replyCallback('Export Complete, please see attached file for export results.');
    }
}

export default ExportCommand;