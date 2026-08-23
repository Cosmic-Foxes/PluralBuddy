/**  * PluralBuddy Discord Bot  *  - is licensed under MIT License.  */ /**  * PluralBuddy Discord Bot  *  - is licensed under MIT License.  */

import {
	type Attachment,
	type CommandContext,
	Container,
	createAttachmentOption,
	createStringOption,
	Declare,
	MediaGallery,
	MediaGalleryItem,
	Options,
	SubCommand,
} from "seyfert";
import { MessageFlags } from "seyfert/lib/types";
import { createSystemOperation } from "@/lib/system-operation";
import {  getOldObject, uploadAttachment } from "@/object-storage";
import { autocompleteAlters } from "../../lib/autocomplete-alters";
import { alterCollection } from "../../mongodb";
import {
	assetStringGeneration,
	operationStringGeneration,
} from "../../types/operation";
import { AlertView } from "../../views/alert";
import { LoadingView } from "../../views/loading";

const options = {
	"system-banner-text": createStringOption({
		description: "The URL for a banner to use for the system.",
	}),
	"system-banner": createAttachmentOption({
		description: "The banner to use for the system. (leave blank to clear)",
		value(data, ok, fail) {
			if (!data.value.contentType?.startsWith("image"))
				fail("This attachment is not an image.");
			if (data.value.size > 2_500_000)
				fail("This attachment is too big. Attachments at most can be 2.5MB.");
			ok(data);
		},
	}),
};

@Declare({
	name: "banner",
	description: "Set an alter's banner.",
	aliases: ["b"],
	contexts: ["BotDM", "Guild"],
})
@Options(options)
export default class EditAlterPictureCommand extends SubCommand {
	override async run(ctx: CommandContext<typeof options>) {
		await ctx.write({
			components: new LoadingView(await ctx.userTranslations()).loadingView(),
			flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
		});

		const user = await ctx.retrievePUser();
		let { "system-banner": attachment, "system-banner-text": attachmentText } =
			ctx.options;

		if (user.system === undefined) {
			return await ctx.editResponse({
				components: new AlertView(await ctx.userTranslations()).errorView(
					"ERROR_SYSTEM_DOESNT_EXIST",
				),
				flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
			});
		}

		if (attachment === undefined && attachmentText === undefined) {
			await createSystemOperation(
				user.system,
				{ systemBanner: null },
				await ctx.userTranslations(),
				"discord",
			);

			return await ctx.editResponse({
				components: [
					...new AlertView(await ctx.userTranslations()).successViewCustom(
						(await ctx.userTranslations()).BANNER_SUCCESS.replace(
							"@%alter%",
							"your system",
						),
					),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const objectName = `${user.storagePrefix}/${assetStringGeneration(32)}`;

		if (attachmentText === undefined) {
			try {
				attachmentText = await uploadAttachment(
					(attachment as { value: Attachment }).value,
					objectName,
					{ authorId: ctx.author.id, alterId: "@system", type: "banner" },
					getOldObject({
						imageProperty: user.system.systemBanner,
						storagePrefix: user.storagePrefix,
					}),
				);
			} catch (error) {
				return await ctx.editResponse({
					components: new AlertView(await ctx.userTranslations()).errorView(
						"ERROR_FAILED_TO_UPLOAD_TO_GCP",
					),
					flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
				});
			}
		}

		await createSystemOperation(
			user.system,
			{ systemBanner: attachmentText },
			await ctx.userTranslations(),
			"discord",
		);

		return await ctx.editResponse({
			components: [
				...new AlertView(await ctx.userTranslations()).successViewCustom(
					(await ctx.userTranslations()).BANNER_SUCCESS.replace(
						"@%alter%",
						"your system",
					),
				),
				new Container().setComponents(
					new MediaGallery().addItems(
						new MediaGalleryItem()
							.setMedia(attachmentText)
							.setDescription(`System profile`),
					),
				),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
