import { TimeLoggedCriteria } from "./types";

export function isTimeLoggedCriteria(value: string): value is TimeLoggedCriteria {
    return ['today', 'yesterday', 'week', 'month', 'year', 'all'].includes(value);
}
