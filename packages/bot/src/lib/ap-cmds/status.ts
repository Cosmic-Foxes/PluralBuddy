import { alterCollection, frontsCollection, mongoClient } from "@/mongodb";
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
import { getOAuthConsents } from "../oauth";

export async function runStatusCommand(ctx: CommandContext, help: boolean) {
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
        return ctx.editResponse({
            components: new AlertView(await ctx.userTranslations()).errorView(
                "DN_ERROR_SE",
            ),
            flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
        });
    }

    const currentAp = system.systemAutoproxy.find((v) => v.serverId === guild.id);

    if (!currentAp) {
        return ctx.ephemeral(
            {
                components: [
                    new Container().setComponents(
                        new TextDisplay().setContent(translations.NO_STATUS_AP),

                        ...(help ? [
                            new Separator(),
                            new TextDisplay().setContent(translations.AP_SYNTAX.replace("{{ aiap }}", (await getOAuthConsents(ctx.author.id)).map(v => v.metadata?.aaid).join("|")))
                        ] : [])
                    ),
                ],
                flags: MessageFlags.IsComponentsV2 + MessageFlags.Ephemeral,
            },
            undefined,
            undefined,
            ctx,
        );
    }

    let integration = null;
    let alterId = null;

    if (currentAp?.autoproxyMode !== "alter" &&
        currentAp?.autoproxyMode !== "latch" &&
        currentAp?.autoproxyMode !== "off") {
        const fronts = await frontsCollection.findOne({ aiapId: currentAp?.autoproxyMode, systemId: ctx.author.id })
        alterId = fronts?.alterId;
        const appDb = mongoClient.db(process.env.WEBSITE_DB ?? "")
        const clients = appDb.collection<{ clientId: string, metadata: { aaid: string }, name: string }>("oauthClient");

        integration = await clients.findOne({ clientId: fronts?.clientId })
    }

    const currentAlter =
        (alterId ?? currentAp.autoproxyAlter) !== undefined
            ? await alterCollection.findOne({
                alterId: Number(alterId ?? currentAp.autoproxyAlter),
                systemId: ctx.author.id,
            })
            : null;


    return ctx.ephemeral(
        {
            components: [
                colorifyContainer(
                    currentAlter === null ? undefined : currentAlter.color,
                ).setComponents(
                    ...(currentAp !== undefined ? [
                        new TextDisplay().setContent(
                            translations[
                                currentAp?.autoproxyMode !== "alter" &&
                                    currentAp?.autoproxyMode !== "latch" &&
                                    currentAp?.autoproxyMode !== "off" ? "INTEGRATION_AP" : "STATUS_AP"].replace(
                                        "{{ mode }}",
                                        currentAp?.autoproxyMode === "latch"
                                            ? translations.LATCH_NAME
                                            : currentAp?.autoproxyMode === "alter"
                                                ? translations.ALTER_NAME
                                                : (integration?.name ?? currentAp?.autoproxyMode ?? ""),
                                    ),
                        ),
                        new Separator(),] : []),
                    new TextDisplay().setContent(
                        currentAp?.autoproxyMode !== "alter" &&
                            currentAp?.autoproxyMode !== "latch" &&
                            currentAp?.autoproxyMode !== "off"
                            ? translations.AP_INTEGRATION_AS.replace("{{ provider }}", (integration?.name ?? "").toLocaleUpperCase())
                            : translations.AP_AS,
                    ),
                    ...((currentAlter) === null
                        ? [new TextDisplay().setContent(translations.NO_STATUS_AP)]
                        : ((
                            await new AlterView(translations).alterProfileView(
                                currentAlter,
                                false,
                            )
                        )[0]?.components ?? [])),
                    ...(help ? [
                        new Separator(),
                        new TextDisplay().setContent(translations.AP_SYNTAX.replace("{{ aiap }}", (await getOAuthConsents(ctx.author.id)).map(v => v.metadata?.aaid).join("|")))
                    ] : [])
                ),
            ],

            flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
        },
        undefined,
        undefined,
        ctx,
    );
}

function colorifyContainer(color: string | null | undefined) {
    return color === null || color === undefined || !color.startsWith("#")
        ? new Container()
        : new Container().setColor(color as ColorResolvable);
}
