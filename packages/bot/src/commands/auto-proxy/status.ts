import { AlertView } from "@/views/alert";
import {
	CommandContext,
	Container,
	Declare,
	Options,
	SubCommand,
	TextDisplay,
} from "seyfert";
import { MessageFlags } from "seyfert/lib/types";

@Declare({
	name: "status",
	description: "Get the status of the current auto-proxy",
	aliases: ["s"],
	contexts: ["Guild"],
})
export default class StatusAutoProxy extends SubCommand {
	override async run(ctx: CommandContext) {
		await ctx.deferReply(true);

		const { system } = await ctx.retrievePUser();
		const translations = await ctx.userTranslations();

		if (system === undefined) {
			return await ctx.editResponse({
				components: new AlertView(await ctx.userTranslations()).errorView(
					"ERROR_SYSTEM_DOESNT_EXIST",
				),
				flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
			});
		}

		return await ctx.ephemeral(
			{
				components: [
					new Container().setComponents(
						new TextDisplay().setContent(translations.STATUS_AP),
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
