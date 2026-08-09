import { buildPkExportPayload } from "@/lib/export";
import { InteractionIdentifier } from "@/lib/interaction-ids";
import { AlertView } from "@/views/alert";
import { LoadingView } from "@/views/loading";
import {
	AttachmentBuilder,
	ComponentCommand,
	type ComponentContext,
} from "seyfert";
import { MessageFlags } from "seyfert/lib/types";

export default class PluralKitExternalExporting extends ComponentCommand {
	componentType = "StringSelect" as const;

	override filter(ctx: ComponentContext<typeof this.componentType>) {
		return InteractionIdentifier.Systems.ExternalExporting.PluralKit.equals(
			ctx.interaction.values[0] ?? "",
		);
	}

	async run(ctx: ComponentContext<typeof this.componentType>) {
		await ctx.write({
			components: new LoadingView(await ctx.userTranslations()).loadingView(),
			flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
		});

		const user = await ctx.retrievePUser();

		if (user.system === undefined) {
			return await ctx.editResponse({
				components: new AlertView(await ctx.userTranslations()).errorView(
					"ERROR_SYSTEM_DOESNT_EXIST",
				),
				flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
			});
		}

		await ctx.followup({
			files: [
				new AttachmentBuilder()
					.setName("system.json")
					.setFile(
						"buffer",
						Buffer.from(await buildPkExportPayload(user.system)),
					),
			],
			flags: MessageFlags.Ephemeral,
		});

		return await ctx.editResponse({
			components: new AlertView(await ctx.userTranslations()).successView(
				"SYSTEM_EXPORT_FINISHED",
			),
			flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
		});
	}
}
