import { alterOptions, runAlterCommand } from "@/lib/ap-cmds/alter";
import { runClearLatch } from "@/lib/ap-cmds/clear-latch";
import { customOptions, runCustomProviderCommand } from "@/lib/ap-cmds/custom";
import { latchOptions, runLatchCommand } from "@/lib/ap-cmds/latch";
import { runOffCommand } from "@/lib/ap-cmds/off";
import { runStatusCommand } from "@/lib/ap-cmds/status";
import { getOAuthConsents } from "@/lib/oauth";
import { AlertView } from "@/views/alert";
import {
    Command,
    CommandContext,
    Container,
    createStringOption,
    Declare,
    IgnoreCommand,
    Options,
    TextDisplay,
} from "seyfert";
import { MessageFlags } from "seyfert/lib/types";

const options = {
    args: createStringOption({
        description: "",
        required: false,
    }),
};

@Declare({
    name: "autoproxy",
    description: "Set autoproxy settings",
    aliases: ["ap", "proxy"],
    contexts: ["Guild"],
    ignore: IgnoreCommand.Slash,
})
@Options(options)
export default class AutoProxyCommand extends Command {
    override async run(ctx: CommandContext<typeof options>) {
        const { args } = ctx.options;
        const translations = await ctx.userTranslations();

        if (
            !args ||
            args.replaceAll(" ", "") === "" ||
            ["status", "s"].includes((args ?? "").split(" ")[0] ?? "")
        ) {
            return await runStatusCommand(
                ctx,
                !(["status", "s"].includes((args ?? "").split(" ")[0] ?? "")),
            );
        }
        if (["off", "shutup"].includes(args.split(" ")[0] ?? "")) {
            return await runOffCommand(ctx);
        }
        if (["latch", "l", "lch"].includes(args.split(" ")[0] ?? "")) {
            (ctx as CommandContext<typeof latchOptions>).options["first-alter"] =
                args.split(" ").slice(1).join(" ");

            return await runLatchCommand(ctx);
        }
        if (["alter", "a"].includes(args.split(" ")[0] ?? "")) {
            const firstAlter = args.split(" ").slice(1).join(" ");

            if (!firstAlter) {
                return await ctx.write({
                    components: [
                        ...new AlertView(translations).errorViewCustom(
                            translations.AP_ALTER_INVALID_SYNTAX.replace(
                                "{{ aiap }}",
                                (await getOAuthConsents(ctx.author.id))
                                    .map((v) => v.metadata?.aaid)
                                    .join("|"),
                            ),
                        ),
                    ],
                    flags: MessageFlags.IsComponentsV2 + MessageFlags.Ephemeral,
                });
            }

            (ctx as CommandContext<typeof alterOptions>).options.alter =
                firstAlter;

            return await runAlterCommand(ctx as CommandContext<typeof alterOptions>);
        }
        if (["cl", "clear-latch"].includes(args.split(" ")[0] ?? "")) {
            return await runClearLatch(ctx);
        }   
        const oauthConsents = await getOAuthConsents(ctx.author.id)
        if (oauthConsents.some(c => c.metadata?.aaid === (args.split(" ")[0] ?? ""))) {
            const consent = oauthConsents.find(c => c.metadata?.aaid === (args.split(" ")[0] ?? ""));

            (ctx as CommandContext<typeof customOptions>).options.provider =
                consent?.clientId ?? "";
                
            return await runCustomProviderCommand(ctx as CommandContext<typeof customOptions>);
        }



        return await ctx.write({
            components: [
                ...new AlertView(translations).errorViewCustom(
                    translations.AP_INVALID_SYNTAX.replace(
                        "{{ aiap }}",
                        (await getOAuthConsents(ctx.author.id))
                            .map((v) => v.metadata?.aaid)
                            .join("|"),
                    ).replace("{{ mode }}", args.split(" ")[0] ?? ""),
                ),
            ],
            flags: MessageFlags.IsComponentsV2 + MessageFlags.Ephemeral,
        });
    }
}
