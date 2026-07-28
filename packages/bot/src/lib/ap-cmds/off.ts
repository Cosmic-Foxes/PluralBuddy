/**  * PluralBuddy Discord Bot  *  - is licensed under MIT License.  */

import { sendAutoproxyOperationDM } from "@/lib/autoproxy-operation";
import { userCollection } from "@/mongodb";
import type { PAutoProxy } from "@/types/auto-proxy";
import { AlertView } from "@/views/alert";
import { CommandContext, Declare, IgnoreCommand, SubCommand } from "seyfert";
import { MessageFlags } from "seyfert/lib/types";

export async function runOffCommand(ctx: CommandContext) {
	await ctx.deferReply(true);

	const { system } = await ctx.retrievePUser();

	if (system === undefined) {
		return await ctx.editResponse({
			components: new AlertView((await ctx.userTranslations())).errorView(
				"ERROR_SYSTEM_DOESNT_EXIST",
			),
			flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
		});
	}

	const guild = await ctx.guild();

	if (guild === undefined) {
		return await ctx.editResponse({
			components: new AlertView((await ctx.userTranslations())).errorView(
				"DN_ERROR_SE",
			),
			flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
		});
	}
	
	await userCollection.updateOne(
		{ userId: system.associatedUserId },
		{
			$pull: {
				"system.systemAutoproxy": {
					autoproxyMode: "off",
					serverId: ctx.guildId
				} satisfies Partial<PAutoProxy>,
			},
		},
	);

	await sendAutoproxyOperationDM(
		system,
		guild,
		(await ctx.userTranslations()),
		"discord",
		"off",
	);

	return await ctx.editResponse({
		components: new AlertView((await ctx.userTranslations())).successViewCustom(
			((await ctx.userTranslations()))
				.SET_AUTO_PROXY.replaceAll("%server_name%", guild.name)
				.replaceAll("%mode%", "off"),
		),
		flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
	});
}