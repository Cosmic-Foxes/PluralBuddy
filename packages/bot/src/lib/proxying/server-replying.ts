import { Button, Container, type Message, Section, TextDisplay } from "seyfert";
import {
	ButtonStyle,
	MessageFlags,
	PermissionFlagsBits,
} from "seyfert/lib/types";
import { client } from "@/index";
import { messagesCollection, userCollection } from "@/mongodb";
import { InteractionIdentifier } from "../interaction-ids";

export async function handleServerReply(message: Message) {
	if (!message.guildId) return;
	if (!message.referencedMessage) return;

	const messageObj = await messagesCollection.findOne({
		messageId: message.referencedMessage.id,
	});

	if (!messageObj) return;
	if (messageObj.systemId === message.user.id) return;

	const authorObj = await userCollection.findOne({
		userId: messageObj.systemId,
	});
	const authorMember = await client.members
		.fetch(message.guildId, messageObj.systemId)
		.catch(() => null);

	if (
		!authorMember ||
		!((authorObj?.nudging ?? { serverReplying: false }).serverReplying ?? false)
	)
		return;
	if (
		(
			(authorObj?.nudging ?? { blockedUsers: [] as string[] }).blockedUsers ??
			([] as string[])
		).includes(message.author.id)
	)
		return;

	const memberPerms = await client.channels.memberPermissions(
		message.channelId,
		authorMember,
		true,
	);

	if (
		!memberPerms.has([
			PermissionFlagsBits.ViewChannel,
			PermissionFlagsBits.ReadMessageHistory,
		])
	)
		return;

	try {
		await message
			.reply({
				components: [
					new Container().setComponents(
						new Section()
							.setComponents(
								new TextDisplay().setContent(
									`<@${messageObj.systemId}>, <@${message.author.id}> replied to you here. [Message Link](<https://discord.com{message.guildId}/${message.channelId}/${message.id}>)`,
								),
							)
							.setAccessory(
								new Button()
									.setStyle(ButtonStyle.Danger)
									.setLabel("Disable replies")
									.setCustomId(
										InteractionIdentifier.Nudge.ToggleServerReplies.create("true"),
									),
							),
					),
				],
				flags: MessageFlags.IsComponentsV2,
				allowed_mentions: { users: [messageObj.systemId] }, 
			})
			.catch(() => null);
	} catch (_) {}
}
