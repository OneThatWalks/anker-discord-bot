import { DiscordCommand, DiscordRequest } from "../../types";

class TimeCommand implements DiscordCommand {

    public constructor(private request: DiscordRequest) {

    }

    public async execute(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default TimeCommand;