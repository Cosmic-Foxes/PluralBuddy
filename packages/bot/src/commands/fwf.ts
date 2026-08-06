import { AlertView } from "@/views/alert";
import {
	AttachmentBuilder,
	Command,
	CommandContext,
	Container,
	createBooleanOption,
	Declare,
	MediaGallery,
	MediaGalleryItem,
	Options,
} from "seyfert";
import { MessageFlags } from "seyfert/lib/types";

const options = {
	"time-machine": createBooleanOption({
		description: "Bleh",
		required: false,
		flag: true
	})
}

@Declare({
	name: "fwf",
	description: "Flat worm Friday in Wall Street",
})
@Options(options)
export default class WhoAskedCommand extends Command {
	override async run(ctx: CommandContext<typeof options>) {
		const roles = await ctx.member?.roles?.list()
		const date = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'long' });

		if (date === "Friday" || ctx.options["time-machine"] !== true) {
			return ctx.write({
				components: new AlertView(await ctx.userTranslations()).errorView(
					"NOT_FRIDAY",
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (ctx.guildId === "1077258761443483708" && !roles?.some(v => v.id === "1080157688752767046")) {
			return ctx.write({
				components: new AlertView((await ctx.userTranslations())).errorView("UNABLE_TO_BE_FUNNY"),
				flags: MessageFlags.IsComponentsV2
			})
		}

        await ctx.deferReply();
		return ctx.editResponse({
			components: [
				new Container().setComponents(
					new MediaGallery().setItems(
						new MediaGalleryItem()
							.setMedia(
								`https://${process.env.FWF_MISSKEY}/files/e86afaa0-7d0c-4cb8-926f-832b09acf507.mp4`,
							)
							.setDescription("flatworm friday :)"),
					),
				),
			],
			flags: MessageFlags.IsComponentsV2 + MessageFlags.Ephemeral,
			allowed_mentions: { parse: [] },
		});
	}
}
