import { alterCollection } from "@/mongodb";
import { AlertView } from "@/views/alert";
import { AlterView } from "@/views/alters";
import {
    CommandContext,
    Container,
    Declare,
    IgnoreCommand,
    Options,
    Separator,
    SubCommand,
    TextDisplay,
} from "seyfert";
import type { ColorResolvable } from "seyfert/lib/common";
import { MessageFlags } from "seyfert/lib/types";

@Declare({
    name: "status",
    description: "Get the status of the current auto-proxy",
    aliases: ["s"],
    contexts: ["Guild"],
    ignore: IgnoreCommand.Message
})
export default class StatusAutoProxy extends SubCommand {
    override async run(ctx: CommandContext) {
        await ctx.deferReply(true);

        const { system } = await ctx.retrievePUser();
        const translations = await ctx.userTranslations();
        const guild = await ctx.guild();

        if (system === undefined) {
            return await ctx.editResponse({
                components: new AlertView(await ctx.userTranslations()).errorView(
                    "ERROR_SYSTEM_DOESNT_EXIST",
                ),
                flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
            });
        }

        if (guild === undefined) {
            return await ctx.editResponse({
                components: new AlertView(await ctx.userTranslations()).errorView(
                    "DN_ERROR_SE",
                ),
                flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
            });
        }

        const currentAp = system.systemAutoproxy.find(
            (v) => v.serverId === guild.id,
        );

        if (!currentAp) {
            return await ctx.ephemeral(
                {
                    components: [
                        new Container().setComponents(
                            new TextDisplay().setContent(translations.NO_STATUS_AP),
                        ),
                    ],
                    flags: MessageFlags.IsComponentsV2 + MessageFlags.Ephemeral,
                },
                undefined,
                undefined,
                ctx,
            );
        }

        const currentAlter =
            currentAp.autoproxyAlter !== undefined
                ? await alterCollection.findOne({
                    alterId: Number(currentAp.autoproxyAlter),
                    systemId: ctx.author.id,
                })
                : null;

        return await ctx.ephemeral(
            {
                components: [
                    colorifyContainer(currentAlter === null ? undefined : currentAlter.color).setComponents(
                        new TextDisplay().setContent(
                            translations.STATUS_AP.replace(
                                "{{ mode }}",
                                currentAp?.autoproxyMode === "latch"
                                    ? translations.LATCH_NAME
                                    : currentAp?.autoproxyMode === "alter"
                                        ? translations.ALTER_NAME
                                        : (currentAp?.autoproxyMode ?? ""),
                            ),
                        ),
                        new Separator(),
                        new TextDisplay().setContent(translations.AP_AS),
                        ...(currentAlter === null
                            ? [new TextDisplay().setContent(translations.NO_STATUS_AP)]
                            : ((
                                await new AlterView(translations).alterProfileView(
                                    currentAlter,
                                    false,
                                )
                            )[0]?.components ?? [])),
                    ),
                ],

                flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
            },
            undefined,
            undefined,
            ctx,
        );
    }
}

function colorifyContainer(color: string | null | undefined) {
    return color === null || color === undefined || !color.startsWith("#") ?
        new Container() : new Container().setColor(color as ColorResolvable)
}