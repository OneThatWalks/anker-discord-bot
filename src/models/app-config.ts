import { injectable } from "tsyringe";

@injectable()
export class AppConfig {
    discord: DiscordConfig;
    googleapis: GoogleApisConfig
    sqlite: SqliteConfig;
}

export class DiscordConfig {
    token: string;
}

export class GoogleApisConfig {
    clientId: string;
    clientSecret: string;
    redirectUrls: string[]
    calendar: CalendarConfig;
}

export class CalendarConfig {
    calendarId: string;
}

export class SqliteConfig {
    databasePath: string;
    schemaPath: string;
}

export default AppConfig;