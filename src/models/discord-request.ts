import { DiscordRequest, IDataAccess, MessageActionTypes } from '../types';
import MessageWrapper from "./message-wrapper";

/**
 * Describes a discord request
 * 
 * @remarks This contains the parameters of the request for the commands
 */
export class DiscordRequestImpl implements DiscordRequest {
    /**
     * Creates an anker discord request
     * 
     * @param message {Message} The original object that triggered the request
     * @param action {MessageActionTypes} The action to invoke
     * @param args {string[]} The arguments of the request
     */
    constructor(public message: MessageWrapper, public action: MessageActionTypes, public args: string[], public dataAccess: IDataAccess) {
    }
}
