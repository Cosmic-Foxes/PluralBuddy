import { Command, CommandContext, Declare, IgnoreCommand } from "seyfert";

@Declare({
    name: "autoproxy",
    description: "Set autoproxy settings",
    aliases: ["ap", "proxy"],
    contexts: ["Guild"],
    ignore: IgnoreCommand.Slash
})
export default class AutoProxyCommand extends Command { 
    override run(context: CommandContext) {
        console.log("run")
    }
}