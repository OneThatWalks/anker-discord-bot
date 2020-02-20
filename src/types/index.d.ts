/* eslint-disable @typescript-eslint/interface-name-prefix */
import { Message } from "discord.js";
import MessageWrapper from "../models/message-wrapper";

// Type definitions for [anker-discord-bot] [1.0.0]
// Project: [anker-discord-bot]
// Definitions by: [Darrien Singleton] <https://github.com/OneThatWalks/anker-discord-bot>

//
// INTERFACES
//

/**
 * The command executor interface
 */
export interface ICommandExecutor {
    execute(context: CommandExecutorContext): CommandExecutorContext;
}

/**
 * The bot interface
 */
//export interface Bot {}

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
    getSchedule(employee: Employee): Promise<Schedule>;

    // KISS
    getSchedules(employees: Employee[]): Promise<Schedule[]>;

    // Potential interface
    authorize(): Promise<void>;
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
}

export interface DiscordRequest {
    action: MessageActionTypes;
    message: MessageWrapper;
    args: string[];

    dataAccess: IDataAccess;
}


//
// Classes
//

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
    LOGOUT = 4
}