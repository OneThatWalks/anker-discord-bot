BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS Employee (
    DiscordId NVARCHAR(64),
    Name NVARCHAR(128),
    Email NVARCHAR(128)
);

CREATE TABLE IF NOT EXISTS TimeClock (
    Id INT PRIMARY KEY,
    DiscordId NVARCHAR(64),
    LoginDateTimeUtc DATETIME,
    LogoutDateTimeUtc DATETIME,
    FOREIGN KEY (DiscordId) REFERENCES Employee(DiscordId)
);

PRAGMA user_version = 1;

COMMIT;
