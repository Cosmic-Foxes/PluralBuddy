import { CommandContext, Declare, Options, SubCommand } from "seyfert";

@Declare({
	name: "disable",
	description: "Disable proxying in this server.",
	aliases: ["d"],
	contexts: ["Guild"]
})
export default class DisableProxying extends SubCommand {
    override async run(ctx: CommandContext) {
        
    }
}
