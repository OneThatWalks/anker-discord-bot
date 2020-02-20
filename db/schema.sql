BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS Employee (
    DiscordId NVARCHAR(64),
    Name NVARCHAR(128),
    Email NVARCHAR(128)
);

CREATE TABLE IF NOT EXISTS TimeClock (
    DiscordId NVARCHAR(64),
    LoginDateTimeUtc DATETIME,
    LogoutDateTimeUtc DATETIME,
    PRIMARY KEY (DiscordId, LoginDateTimeUtc),
    FOREIGN KEY (DiscordId) REFERENCES Employee(DiscordId)
);

PRAGMA user_version = 1;

COMMIT;
