import { Schedule, ScheduleDay, Employee } from '../types';

class ScheduleImpl implements Schedule {

    public days: ScheduleDay[];
    public employee: Employee;

    public toString(): string {
        const orderedByStart = this.days.sort((a, b) => b.start > a.start ? -1 : 1);

        const lines = orderedByStart.map(item => item.toString());

        return lines.join('\r\n');
    }

}

export default ScheduleImpl;