import { TimeLoggedCriteria } from "./types";

export function isTimeLoggedCriteria(value: string): value is TimeLoggedCriteria {
    return ['today', 'yesterday', 'week', 'month', 'year', 'all'].includes(value);
}

export function formatSeconds(seconds: number): string {
    const secondsInAnHour = 3600;
    const secondsInAMinute = 60;

    // Finds leftover seconds after getting whole hours from timespan
    const leftOverSeconds = seconds % secondsInAnHour;

    // First get hours using Math.floor() to remove remainder
    const hours = Math.floor(seconds / secondsInAnHour).toString();

    // Next use the leftover seconds to determine minutes
    const minute = Math.floor(leftOverSeconds / secondsInAMinute).toString();

    // Finally use modulus to get leftover seconds from whole minutes
    const second = Math.floor(leftOverSeconds % secondsInAMinute).toString();

    // Return formatted HH:MM:SS
    // use padStart to fill empty space with 0's
    // Hours can be a very large number so allow it to grow
    return `${hours.padStart(hours.length > 2 ? hours.length : 2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
}
