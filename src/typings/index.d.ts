import { Message, StringResolvable, MessageOptions, MessageAdditions } from "discord.js";
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
}

export interface ITimeClockRepo {
    recordLogin(discordId: string): void;
    recordLogout(discordId: string): void;
}

export interface IScheduleRepo {
    getSchedule(employee: Employee): Promise<Schedule>;

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

export class Schedule {

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
}

// ENUM

export const enum MessageActionTypes {
    NONE = 0,
    SCHEDULE = 1,
    AUTH_CODE = 2,
    LOGIN = 3,
    LOGOUT = 4
}