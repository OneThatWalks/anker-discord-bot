import { inject, injectable } from 'tsyringe';
import AppConfig from '../models/app-config';
import { ITimeClockRepo } from '../types';

@injectable()
class TimeClockRepo implements ITimeClockRepo {

    /**
     * Creates a time clock repository
     */
    constructor(@inject(AppConfig) private appConfig: AppConfig) {
        
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    recordLogin(discordId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    recordLogout(discordId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

export default TimeClockRepo;