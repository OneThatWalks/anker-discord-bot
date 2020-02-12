import { ScheduleDay } from '../types';

class ScheduleDayImpl implements ScheduleDay {
    public start: Date;
    public end: Date;
    public toString(): string {
        return `${this.start.toLocaleString()} - ${this.end.toLocaleString()}`;
    }
}

export default ScheduleDayImpl;