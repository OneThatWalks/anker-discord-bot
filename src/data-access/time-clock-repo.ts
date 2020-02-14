import { inject } from 'tsyringe';
import AppConfig from '../models/app-config';
import { ITimeClockRepo } from '../types';

class TimeClockRepo implements ITimeClockRepo {

    /**
     * Creates a time clock repository
     */
    constructor(@inject(AppConfig) private appConfig: AppConfig) {
        
    }

    recordLogin(discordId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }    
    recordLogout(discordId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

export default TimeClockRepo;