import { Schedule, ScheduleDay } from '../types';

class ScheduleImpl implements Schedule {

    public days: ScheduleDay[];

    public toString(): string {
        const orderedByStart = this.days.sort((a, b) => b.start > a.start ? -1 : 1);

        const lines = orderedByStart.map(item => item.toString());

        const result = '\r\nSchedule:\r\n' + lines.join('\r\n');

        return result;
    }

}

export default ScheduleImpl;