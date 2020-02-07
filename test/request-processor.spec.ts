import RequestProcessorImpl from '../src/request-processor'
import { Message } from 'discord.js';
import { equal } from 'assert';
import { MessageActionTypes } from '../src/typings';

describe('Request Processor', () => {
    const service = new RequestProcessorImpl();

    describe('getRequest()', () => {
        it('should return auth code request', () => {
            const msg = new Message(null, null, null);
            msg.content = '!authcode';
    
            const result = service.getRequest(msg);
            equal(result.action, MessageActionTypes.AUTH_CODE);
        });

        it('should return schedule request', () => {
            const msg = new Message(null, null, null);
            msg.content = '!schedule';
    
            const result = service.getRequest(msg);
            equal(result.action, MessageActionTypes.SCHEDULE);
        });

        it('should return schedule request 2', () => {
            const msg = new Message(null, null, null);
            msg.content = '!view';
    
            const result = service.getRequest(msg);
            equal(result.action, MessageActionTypes.SCHEDULE);
        });

        it('should return null', () => {
            const msg = new Message(null, null, null);
            msg.content = '!null';
    
            const result = service.getRequest(msg);
            equal(result, null);
        });
    });
});