import { CommandContext, Declare, Options, SubCommand } from "seyfert";

@Declare({
	name: "enable",
	description: "Enabling proxying in this server.",
	aliases: ["e"],
	contexts: ["Guild"]
})
export default class EnableProxying extends SubCommand {
    override async run(ctx: CommandContext) {
        
    }
}
