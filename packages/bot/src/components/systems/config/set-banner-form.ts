/**  * PluralBuddy Discord Bot  *  - is licensed under MIT License.  *//**  * PluralBuddy Discord Bot  *  - is licensed under MIT License.  *//**  * PluralBuddy Discord Bot  *  - is licensed under MIT License.  */
import { type Attachment, ModalCommand, type ModalContext } from "seyfert";
import { MessageFlags } from "seyfert/lib/types";
import { getGcpAccessToken, uploadAttachment } from "@/gcp";
import { getSystemFeatures } from "@/lib/get-system-flags";
import { InteractionIdentifier } from "@/lib/interaction-ids";
import { createSystemOperation } from "@/lib/system-operation";
import { alterCollection } from "@/mongodb";
import { assetStringGeneration } from "@/types/operation";
import { AlertView } from "@/views/alert";
import { AlterView } from "@/views/alters";
import { SystemSettingsView } from "@/views/system-settings";
export default class SetPFPForm extends ModalCommand {
	override filter(context: ModalContext) {
		return InteractionIdentifier.Systems.Configuration.FormSelection.SystemBannerForm.startsWith(
			context.customId,
		);
	}

	override async run(ctx: ModalContext) {
		await ctx.interaction.update(ctx.loading(await ctx.userTranslations()));

		const { system, storagePrefix } = await ctx.retrievePUser()

		if (system === undefined) {
			return await ctx.editResponse({
				components: new AlertView((await ctx.userTranslations())).errorView(
					"ERROR_SYSTEM_DOESNT_EXIST",
				),
				flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
			});
		}

		const attachment = {
			value: ctx.interaction.getFiles(
				InteractionIdentifier.Systems.Configuration.FormSelection.SystemBannerType.create(),
				true,
			)[0] as Attachment,
		};

		if (attachment.value.size > 1_000_000) {
			return await ctx.editResponse({
				components: new AlertView((await ctx.userTranslations())).errorView(
					"ERROR_ATTACHMENT_TOO_LARGE",
				),
				flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
			});
		}

		let objectName = `${(process.env.BRANCH ?? "c")[0]}/${storagePrefix}/${assetStringGeneration(32)}`;;
		const bucketName = process.env.GCP_BUCKET ?? "";

		try {
			const accessToken = await getGcpAccessToken();
			const { newObject } = await uploadAttachment(
				(attachment as { value: Attachment }).value,
				accessToken,
				bucketName,
				objectName,
				{ authorId: ctx.author.id, alterId: '@system', type: "banner/form" },
				(system.systemBanner ?? "").startsWith("https://pluralbuddy.giftedly.dev") ? `${(process.env.BRANCH ?? "a")[0]}/${storagePrefix}${system.systemBanner?.split(storagePrefix)[1]}` : undefined
			);
			
			objectName = newObject
		} catch (error) {
			return await ctx.editResponse({
				components: new AlertView((await ctx.userTranslations())).errorView(
					"ERROR_FAILED_TO_UPLOAD_TO_GCP",
				),
				flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
			});
		}

		const publicUrl = `https://pluralbuddy.giftedly.dev/${objectName}`;

		await createSystemOperation(
			system, { systemBanner: publicUrl }, (await ctx.userTranslations()), "discord"
		);

		return await ctx.editResponse({
			components: [
				...new SystemSettingsView((await ctx.userTranslations()), getSystemFeatures(system)?.preferAccessiblity).topView(
					"public-settings",
					system.associatedUserId,
				),
				...new SystemSettingsView((await ctx.userTranslations()), getSystemFeatures(system)?.preferAccessiblity).publicProfile(
					system,
					(await ctx.getDefaultPrefix()) ?? "",
					ctx.interaction?.message?.messageReference === undefined,
				),
			],
			flags: MessageFlags.IsComponentsV2 + MessageFlags.Ephemeral,
		});
	}
}
