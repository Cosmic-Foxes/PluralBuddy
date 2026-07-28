import { runStatusCommand } from "@/lib/ap-cmds/status";
import { AlertView } from "@/views/alert";
import { Command, CommandContext, createStringOption, Declare, IgnoreCommand, Options } from "seyfert";

const options = {
    args: createStringOption({
        description: "",
        required: false
    })
}

@Declare({
    name: "autoproxy",
    description: "Set autoproxy settings",
    aliases: ["ap", "proxy"],
    contexts: ["Guild"],
    ignore: IgnoreCommand.Slash
})
@Options(options)
export default class AutoProxyCommand extends Command { 
    override async run(ctx: CommandContext<typeof options>) {
        const { args } = ctx.options;
        const translations = await ctx.userTranslations()

        if (!args || args.replaceAll(" ", '') === "" || args.split(" ")[0] === "status") {
            return await runStatusCommand(ctx);
        }
    }
}