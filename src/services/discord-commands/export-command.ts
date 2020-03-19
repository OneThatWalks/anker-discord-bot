import { DiscordCommand, DiscordRequest, Employee, TimeClockRecord, TimeLoggedCriteria, EmployeePunchRecords } from "../../types";
import { isTimeLoggedCriteria, employeePunchRecordsToCsv } from "../../util";

/**
 * The export command
 */
class ExportCommand implements DiscordCommand {

    private readonly fileLocation = '.\\exports\\';

    constructor(private request: DiscordRequest) {

    }

    async execute(): Promise<void> {
        let employees: Employee[];
        try {
            employees = await this.request.dataAccess.getEmployees();
        } catch (err) {
            console.log(err);
            await this.request.message.replyCallback('There was an issue completing your request, please try again later.\r\nIf this issue persists let an administrator know.');
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
            await this.request.message.replyCallback('There was an issue completing your request, please try again later.\r\nIf this issue persists let an administrator know.');
            return;
        }

        const employeePunches: EmployeePunchRecords[] = [];
        punches.forEach((p) => {
            const existingEmployeeRecordIndex = employeePunches.findIndex(e => e.employee.DiscordId === p.DiscordId);
            if (existingEmployeeRecordIndex > -1) {
                employeePunches[existingEmployeeRecordIndex].punches.push(p);
            } else {
                const employee = employees.find(e => e.DiscordId === p.DiscordId);
                employeePunches.push({ employee, punches: [p] } as EmployeePunchRecords);
            }
        });

        if (!employeePunches || employeePunches.length === 0) {
            // No results
            await this.request.message.replyCallback('There is nothing to export for this criteria.');
            return;
        }

        const str = employeePunchRecordsToCsv(employeePunches);
        const path = `${this.fileLocation}${timeLoggedCriteria}_${Date.now()}.csv`
        await this.request.dataAccess.writeAsync(path, str);

        await this.request.message.replyCallback('your export is complete. Please see attached file for export results.', { files: [path] });
    }
}

export default ExportCommand;