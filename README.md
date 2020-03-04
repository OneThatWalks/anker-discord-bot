# anker-discord-bot
![anker-discord-bot CI](https://github.com/OneThatWalks/anker-discord-bot/workflows/anker-discord-bot%20CI/badge.svg)

![Typescript](https://img.shields.io/github/package-json/dependency-version/onethatwalks/anker-discord-bot/dev/typescript/master)

A discord bot.

## Pre-requisites

- yarn (or NPM, but yarn is preffered)
- node version >=12.0.0
- git
- sqlite3

## Build from source

First install all of the dependencies with `yarn install`

Next you can run the `build` script to build the application
`yarn build`

## Running the application

First create a `config.json` file in the project.  This should match the AppConfig.ts contract from [here](src/models/app-config.ts)

Make sure the db exists
```text
sqlite3 ./db/anker-store.db
SELECT 'Test';
.exit
```

Run the application with `node ./dist/index.js -configFile ./config.json`

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
