import Bot from "./bot";

const args = process.argv.slice(2)
let token: string;
let databasePath: string;

var tokenArgIndex = args.findIndex(arg => arg.toLowerCase() === '-token');
var databasePathArgIndex = args.findIndex(arg => arg.toLowerCase() === '-databasepath');

if (tokenArgIndex > -1) {
    token = args[tokenArgIndex + 1];
}

if (databasePathArgIndex > -1) {
    databasePath = args[databasePathArgIndex + 1];
}

if (!token || !databasePath) {
    process.exit(1);
}

const bot = new Bot(token, databasePath);