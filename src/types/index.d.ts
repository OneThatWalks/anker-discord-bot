// Type definitions for [anker-discord-bot] [1.0.0]
// Project: [anker-discord-bot]
// Definitions by: [Darrien Singleton] <https://github.com/OneThatWalks/anker-discord-bot>

/* eslint-disable @typescript-eslint/interface-name-prefix */
import { Message } from "discord.js";
import MessageWrapper from "../models/message-wrapper";

/**
 * The command executor interface
 */
export interface ICommandExecutor {
    execute(context: CommandExecutorContext): CommandExecutorContext;
}


export interface IDataAccess extends IEmployeeRepo, ITimeClockRepo, IScheduleRepo {

}

export interface IEmployeeRepo {
    addEmployee(employee: Employee): Promise<void>;
    removeEmployee(discordId: string): Promise<void>;
    getEmployee(discordId: string): Promise<Employee>;
    getEmployees(): Promise<Employee[]>;
}

export interface ITimeClockRepo {
    recordLogin(discordId: string): Promise<Date>;
    recordLogout(discordId: string): Promise<Date>;
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

/**
 * Describes the command execution context
 */
export class CommandExecutorContext {
    action: MessageActionTypes;
    clientMessage: Message;
    response: string;
    // Future work clock
    // responses: string[]
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
    Id: number;
    DiscordId: string;
    LoginDateTimeUtc: Date;
    LogoutDateTimeUtc: Date;
}

// ENUM

export const enum MessageActionTypes {
    NONE = 0,
    SCHEDULE = 1,
    AUTH_CODE = 2,
    LOGIN = 3,
    LOGOUT = 4,
    HELP = 5
}