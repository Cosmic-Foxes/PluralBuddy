import { InteractionIdentifier } from "@/lib/interaction-ids";
import { writeUserById } from "@/types/user";
import { AlertView } from "@/views/alert";
import { NudgePreferences } from "@/views/nudge-preferences";
import { ComponentCommand, ComponentContext } from "seyfert";
import { MessageFlags } from "seyfert/lib/types";

export default class AddUserBlockListNudge extends ComponentCommand {
	componentType = "Button" as const;

	override filter(context: ComponentContext<typeof this.componentType>) {
		return InteractionIdentifier.Nudge.ToggleServerReplies.startsWith(
			context.customId,
		);
	}

	override async run(ctx: ComponentContext<typeof this.componentType>) {
		const silent = InteractionIdentifier.Nudge.ToggleServerReplies.substring(
			ctx.customId,
		)[0];
		let user = await ctx.retrievePUser();
		const silentMode = Boolean(silent.toLowerCase());
		// Update database property to serverReplying
		await writeUserById(user.userId, {
			...user,
			nudging: { 
				...user.nudging, 
				serverReplying: !(user.nudging.serverReplying ?? false) 
			},
		});

		// Reflect the state change in the local object variable
		user.nudging.serverReplying = !(user.nudging.serverReplying ?? false);

		if (silentMode)
			return await ctx.write({
				// Update string key to reflect your new server reply context if necessary
				components: new AlertView(await ctx.userTranslations()).successView(
					"DISABLED_SERVER_REPLIES",
				),
				flags: MessageFlags.IsComponentsV2 + MessageFlags.Ephemeral,
			});
		else
			return await ctx.update({
				components: new NudgePreferences(
					await ctx.userTranslations(),
				).nudgePreferences(user),
				flags: MessageFlags.IsComponentsV2 + MessageFlags.Ephemeral,
			});
	}
}
