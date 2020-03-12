// Type definitions for [anker-discord-bot] [1.0.0]
// Project: [anker-discord-bot]
// Definitions by: [Darrien Singleton] <https://github.com/OneThatWalks/anker-discord-bot>

/* eslint-disable @typescript-eslint/interface-name-prefix */

export interface IDataAccess extends IEmployeeRepo, ITimeClockRepo, IScheduleRepo {

}

export interface IEmployeeRepo {
    addEmployee(employee: Employee): Promise<void>;
    removeEmployee(discordId: string): Promise<void>;
    getEmployee(discordId: string): Promise<Employee>;
    getEmployees(): Promise<Employee[]>;
}

export interface ITimeClockRepo {
    recordLogin(discordId: string, date: Date): Promise<Date>;
    recordLogout(discordId: string, date: Date): Promise<Date>;
    getTimeLogged(discordIds: string[], criteria: TimeLoggedCriteria): Promise<TimeLoggedResult[]>;
    getPunches(discordIds: string[], criteria: TimeLoggedCriteria): Promise<TimeClockRecord[]>;
}

export interface IScheduleRepo {
    getSchedules(...employees: Employee[]): Promise<Schedule[]>;

    authorize(code: string): Promise<void>;
}

export interface RequestProcessor {
    getRequest(message: MessageWrapper): DiscordRequest;
}

export interface DiscordCommand {
    execute(): Promise<void>;
}

export interface DiscordInvoker {
    authorize(): Promise<void>;
    schedule(): Promise<void>;
    clockIn(): Promise<void>;
    clockOut(): Promise<void>;
    help(): Promise<void>;
    time(): Promise<void>;
    export(): Promise<void>;
}

export interface DiscordRequest {
    action: MessageActionTypes;
    message: MessageWrapper;
    args: string[];

    dataAccess: IDataAccess;
}

interface DiscordClient {
    readonly userId: string;

    on(event: 'message', listener: (message: MessageWrapper) => void): this;
    on(event: string, listener: Function): this;

    messageChannel(channel: string, msg: string | string[] | null): Promise<void>;
}

interface GoogleApiClient {

    /**
     * Authenticates this application with the google api
     * @param code The google OAuth2.0 code
     */
    authorizeWithCode(code: string): Promise<void>;

    /**
     * Indicates whether this client is authorized
     */
    readonly isAuthorized: boolean;

    /**
     * Queries calendar events for the specified start and end date
     * @param startDateTime The start time for the event query
     * @param endDateTime The end time for the event query
     * 
     * @returns The google calendar events
     */
    getCalendarEvents(startDateTime: Date, endDateTime: Date): Promise<GoogleEvent[]>;
}

interface GoogleEvent {
    /**
     * The start of the event
     *
     * @type {(Date | null)}
     */
    start: Date | null;

    /**
     * The end of the event
     *
     * @type {(Date | null)}
     */
    end: Date | null;

    /**
     * The attendees of the event
     *
     * @type {(string[] | null)}
     */
    attendeesEmails: string[] | null;
}

export interface Schedule {
    days: ScheduleDay[];
    employee: Employee;
    toString(): string;
}

export interface ScheduleDay {
    start: Date;
    end: Date;
    toString(): string;
}

export interface TimeLoggedResult {
    discordId: string;
    time: number;
    criteria: TimeLoggedCriteria;
}

export interface EmployeePunchRecords {
    employee: Employee;
    punches: TimeClockRecord[];
}

export interface MessageWrapper {
    /**
     * The content of the message
     */
    content: string;

    /**
     * The message author snowflake
     */
    authorId: string;

    /**
     * The message author username
     */
    author: string;

    /**
     * Replies to a message object
     * @param content The content to send
     * @param options The optional additional arguments
     * 
     * @returns {Promise<MessageWrapper>} A message object that was replied
     */
    replyCallback(content?: string | string[], options?: unknown): Promise<MessageWrapper>;

    /**
     * Finds a user by id
     * @param key The user identifier
     * 
     * @returns {unknown} The user
     */
    findUser(key: string): unknown;
}

/**
 * Describes an employee
 */
export class Employee {
    DiscordId: string;
    Name: string;
    Email: string;
}

export class TimeClockRecord {
    DiscordId: string;
    LoginDateTimeUtc: Date;
    LogoutDateTimeUtc: Date;
}

// ENUM

export type TimeLoggedCriteria = 'today' | 'yesterday' | 'week' | 'last-week' | 'month' | 'last-month' | 'year' | 'last-year' | 'all';

export const enum MessageActionTypes {
    NONE = 0,
    SCHEDULE = 1,
    AUTH_CODE = 2,
    LOGIN = 3,
    LOGOUT = 4,
    HELP = 5,
    TIME = 6,
    EXPORT = 7
}