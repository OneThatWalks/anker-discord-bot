import { inject, injectable } from "tsyringe";
import ScheduleImpl from '../models/schedule';
import ScheduleDayImpl from '../models/schedule-day';
import { Employee, IScheduleRepo, Schedule, ScheduleDay, GoogleApiClient, GoogleEvent } from '../types';

@injectable()
class ScheduleRepo implements IScheduleRepo {

    /**
     * Initializes the schedule repo
     */
    constructor(@inject('GoogleApiClient') private googleApiClient: GoogleApiClient) {
    }

    async getSchedules(...employees: Employee[]): Promise<Schedule[]> {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);

        try {
            const results: GoogleEvent[] = await this.googleApiClient.getCalendarEvents(startDate, endDate);

            const schedules: Schedule[] = [];

            for (const event of results) {
                // Read each event and construct schedule

                for (const employee of employees) {
                    // Iterate and check employees schedules

                    const schedule = new ScheduleImpl();
                    schedule.employee = employee;
                    schedule.days = [];

                    if (event.attendeesEmails.findIndex(attendee => employee.Email.toLowerCase() === attendee) > -1) {
                        const day: ScheduleDay = new ScheduleDayImpl();
                        day.start = new Date(event.start)
                        day.end = new Date(event.end);
                        schedule.days.push(day);
                    }

                    if (schedule.days.length > 0) {
                        schedules.push(schedule);
                    }
                }
            }

            return schedules;

        } catch (err) {
            console.error(err);
            throw err;
        }

        // REMARKS: Calendar id can be found in calendar sharing settings
        return null;
    }

    public async authorize(code: string): Promise<void> {
        return this.googleApiClient.authorizeWithCode(code);
    }
}

export default ScheduleRepo;