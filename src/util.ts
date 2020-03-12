import { TimeLoggedCriteria } from "./types";

export function isTimeLoggedCriteria(value: string): value is TimeLoggedCriteria {
    return [
        'today', 'yesterday', 'week', 'last-week', 'month',
        'last-month', 'year', 'last-year', 'all'
    ].includes(value);
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

/**
 * Parses a time parameter from a request argument array
 * @param args Request argument array
 * @returns {Date} The parsed date object
 */
export function parseTimeFromArgs(args: string[]): Date {

    // Pull out args that match (ie: start with @)
    const timeArg: string[] = args?.filter((item: string) => item.startsWith('@')) ?? null;

    if (!timeArg) {
        return null;
    }

    const date: Date = new Date();
    // Cut strings that look like this 1:04 into [1, 04]
    const time = timeArg[0].slice(1).split(':');
    let hour, minute, ampm;

    if (time?.length > 0) {
        // Probably just an hour

        // Separate numbers from characters
        const num = time[0].match(/\d+/);
        const str = time[0].match(/[AaPp][Mm]|[Aa]|[Pp]/g);

        // Set am/pm if exists
        if (str?.length > 0) {
            ampm = str[0];
        }

        // Parse hour number
        if (num?.length > 0) {
            hour = parseInt(num[0], 10);
        }
    }

    // Minute param
    if (time?.length > 1) {

        // Separate numbers from characters
        const num = time[1].match(/\d+/);
        const str = time[1].match(/[AaPp][Mm]|[Aa]|[Pp]/g);

        // Set am/pm if exists
        // Overwrite if needed since am/pm usually exists after the hour
        if (str?.length > 0) {
            ampm = str[0];
        }
        // Parse minute number
        if (num?.length > 0) {
            minute = parseInt(num[0], 10);
        }
    }

    if (!ampm) {
        const afterTimeArgIndex = args.indexOf(timeArg[0]) + 1;
        if (afterTimeArgIndex < args.length) {
            const argAfterTime = args[afterTimeArgIndex];

            const str = argAfterTime.match(/[AaPp][Mm]|[Aa]|[Pp]/);

            if (str?.length > 0) {
                ampm = str[0];
            }
        }
    }

    if (hour) {
        let dateHours = hour;
        if (ampm) {
            // If PM add 12 hours to hours to work with Date
            if (ampm.match(/[Pp][Mm]|[Pp]/)?.length > 0) {
                dateHours += 12;
            }
        }

        // Set date HH:mm:ss
        date.setHours(dateHours);
        date.setMinutes(0);
        date.setSeconds(0);
    }

    if (minute) {
        // Set minutes from parsed time
        date.setMinutes(minute);
    }

    return date;
}

/**
 * Gets dates from a @see TimeLoggedCriteria
 * @param criteria The interval criteria
 * 
 * @returns a start date and end date based on the criteria
 */
export function getDatesFromCriteria(criteria: TimeLoggedCriteria): [Date, Date] {
    const startDate: Date = new Date();
    const endDate: Date = new Date();

    switch (criteria) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);

            endDate.setDate(endDate.getDate() + 1);
            endDate.setHours(0, 0, 0, 0);
            break;
        case 'yesterday':
            startDate.setDate(startDate.getDate() - 1)
            startDate.setHours(0, 0, 0, 0);

            endDate.setHours(0, 0, 0, 0);
            break;
        case 'week':
            startDate.setDate(startDate.getDate() - startDate.getDay());
            startDate.setHours(0, 0, 0, 0);

            endDate.setDate(endDate.getDate() + (7 - endDate.getDay()));
            endDate.setHours(0, 0, 0, 0);
            break;
        case 'last-week':
            startDate.setDate(startDate.getDate() - startDate.getDay() - 7);
            startDate.setHours(0, 0, 0, 0);

            endDate.setDate(endDate.getDate() - endDate.getDay());
            endDate.setHours(0, 0, 0, 0);
            break;
        case 'month':
            startDate.setDate(startDate.getDate() - startDate.getDate() + 1);
            startDate.setHours(0, 0, 0, 0);

            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(endDate.getDate() - endDate.getDate() + 1);
            endDate.setHours(0, 0, 0, 0);
            break;
        case 'last-month':
            startDate.setMonth(startDate.getMonth() - 1);
            startDate.setDate(startDate.getDate() - startDate.getDate() + 1);
            startDate.setHours(0, 0, 0, 0);

            endDate.setDate(endDate.getDate() - endDate.getDate() + 1);
            endDate.setHours(0, 0, 0, 0);
            break;
        case 'year':
            startDate.setMonth(0, 1);
            startDate.setHours(0, 0, 0, 0);

            endDate.setFullYear(endDate.getFullYear() + 1);
            endDate.setMonth(0, 1);
            endDate.setHours(0, 0, 0, 0);
            break;
        case 'last-year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            startDate.setMonth(0, 1);
            startDate.setHours(0, 0, 0, 0);

            endDate.setMonth(0, 1);
            endDate.setHours(0, 0, 0, 0);
            break;
        case 'all':
            startDate.setFullYear(2019);
            startDate.setMonth(0, 1);
            startDate.setHours(0, 0, 0, 0);
            break;
    }

    return [startDate, endDate];
}
