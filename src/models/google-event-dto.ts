/* eslint-disable @typescript-eslint/camelcase */
import { calendar_v3 } from "googleapis";
import { GoogleEvent } from "../types";

class GoogleEventDto implements GoogleEvent {
    
    public start: Date | null;
    public end: Date | null;
    public attendeesEmails: string[] | null;

    /**
     * Seeds google calendar dto from an event source
     * @param event The google event source
     */
    constructor(public event: calendar_v3.Schema$Event) {
        this.attendeesEmails = event.attendees.map((attendee: calendar_v3.Schema$EventAttendee) => attendee.email);
        this.start = new Date(event.start.dateTime);
        this.end = new Date(event.end.dateTime);
    }
}

export default GoogleEventDto;