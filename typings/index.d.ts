import { Message } from "discord.js";

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
export interface IBot {
    
}

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
    getSchedule(employee: Employee): any

    // Potential interface
    authorize(): void;
    authorize(code: string): void;
}

export interface IMessageProcessor {
    process(message: string): MessageActionTypes;
}

//
// Classes
//

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

/**
 * Describes the data access configuration
 */
export class DataAccessConfiguration {
    databasePath: string;

    scheduleRepo: ScheduleRepoConfiguration;
}

export class ScheduleRepoConfiguration {
    clientId: string;
    clientSecret: string;
    redirectUrls: string[]
}

// ENUM

export const enum MessageActionTypes {
    NONE = 0,
    SCHEDULE = 1,
    AUTH_CODE = 2
}