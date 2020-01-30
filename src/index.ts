import Bot from "./bot";

const args = process.argv.slice(2)
let token: string;

if (args[0].toLowerCase() === '-token') {
    token = args[1];
}

const bot = new Bot(token);