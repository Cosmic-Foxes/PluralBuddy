/**  * PluralBuddy Discord Bot  *  - is licensed under MIT License.  */

import z from "zod";
import { PSystemObject, type PSystem } from "../types/system";
import { PAlterObject } from "../types/alter";
import { alterCollection, tagCollection } from "../mongodb";
import { PTagObject } from "@/types/tag";
import {
	AlterProtectionFlags,
	PluralKitGroup,
	PluralKitMember,
	SystemProtectionFlags,
	TagProtectionFlags,
} from "plurography";
import { UUID } from "mongodb";
import {
	listFromMaskAlters,
	listFromMaskSystems,
	listFromMaskTags,
} from "./privacy-bitmask";
import { PluralKitSystem, PrivacyLevel } from "plurography/dist/pluralkit";

export { ImportNotation } from "plurography";

export async function buildExportPayload(system: PSystem) {
	const alters = await alterCollection
		.find({ systemId: system.associatedUserId })
		.toArray();
	const tags = await tagCollection
		.find({ systemId: system.associatedUserId })
		.toArray();

	return JSON.stringify({
		system,
		alters,
		tags,
	});
}

export async function buildPkExportPayload(system: PSystem) {
	const alters = await alterCollection
		.find({ systemId: system.associatedUserId })
		.toArray();
	const tags = await tagCollection
		.find({ systemId: system.associatedUserId })
		.toArray();

	const convertedAlters = alters.map((alter, i) => ({
		originalId: alter.alterId,
		parsed: PluralKitMember.safeParse({
			id: i.toString(),
			uuid: crypto.randomUUID(),
			name: alter.username.substring(0, 100),
			display_name: alter.displayName.substring(0, 100),
			color: alter.color,
			birthday: null,
			avatar_url: alter.avatarUrl,
			webhook_avatar_url: null,
			pronouns: alter.pronouns ? alter.pronouns?.substring(0, 100) : null,
			banner: alter.banner,
			description: alter.description,
			created: new Date(),
			keep_proxy: false,
			tts: false,
			autoproxy_enabled: false,
			message_count: 0,
			last_message_timestamp: new Date(),
			proxy_tags: alter.proxyTags.map((c) => ({
				prefix: c.prefix,
				suffix: c.suffix,
			})),
			privacy: {
				visiblity: listFromMaskAlters(alter.public).includes(
					AlterProtectionFlags.VISIBILITY,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				name_privacy: listFromMaskAlters(alter.public).includes(
					AlterProtectionFlags.NAME,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				description_privacy: listFromMaskAlters(alter.public).includes(
					AlterProtectionFlags.DESCRIPTION,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				banner_privacy: listFromMaskAlters(alter.public).includes(
					AlterProtectionFlags.BANNER,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				birthday_privacy: PrivacyLevel.parse("private"),
				pronoun_privacy: listFromMaskAlters(alter.public).includes(
					AlterProtectionFlags.PRONOUNS,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				avatar_privacy: listFromMaskAlters(alter.public).includes(
					AlterProtectionFlags.AVATAR,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				metadata_privacy: PrivacyLevel.parse("private"),
				proxy_privacy: PrivacyLevel.parse("private"),
			},
		}),
	}));

	const convertedTags = tags.map((tag, i) =>
		PluralKitGroup.safeParse({
			id: i.toString(),
			uuid: crypto.randomUUID(),
			name: tag.tagFriendlyName.substring(0, 100).replaceAll(" ", ""),
			display_name: tag.tagFriendlyName.substring(0, 100),
			description: tag.tagDescription ?? null,
			icon: null,
			banner: null,
			color: tag.tagColor,
			created: new Date(),
			members: convertedAlters
				.filter((v) => tag.associatedAlters.includes(v.originalId.toString()))
				.map((c) => c.parsed.data?.id ?? ""),
			privacy: {
				name_privacy: listFromMaskTags(tag.public).includes(
					TagProtectionFlags.NAME,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				description_privacy: listFromMaskTags(tag.public).includes(
					TagProtectionFlags.DESCRIPTION,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				banner_privacy: PrivacyLevel.parse("private"),
				icon_privacy: PrivacyLevel.parse("private"),
				list_privacy: listFromMaskTags(tag.public).includes(
					TagProtectionFlags.ALTERS,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				metadata_privacy: PrivacyLevel.parse("private"),
				visiblity: PrivacyLevel.parse("private"),
			},
		}),
	);

	return JSON.stringify(
		PluralKitSystem.parse({
			version: 2,
			id: system.associatedUserId,
			uuid: crypto.randomUUID(),
			created: new Date(),

			name: system.systemName.substring(0, 100),
			description: system.systemDescription
				? system.systemDescription.substring(0, 100)
				: null,
			tag: system.systemDisplayTag?.substring(0, 100),
			avatar_url: system.systemAvatar,
			pronouns: system.systemPronouns?.substring(0, 100),
			banner: system.systemBanner,
			color: null,
			privacy: {
				name_privacy: listFromMaskSystems(system.public).includes(
					SystemProtectionFlags.NAME,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				avatar_privacy: listFromMaskSystems(system.public).includes(
					SystemProtectionFlags.AVATAR,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				description_privacy: listFromMaskSystems(system.public).includes(
					SystemProtectionFlags.DESCRIPTION,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				banner_privacy: listFromMaskSystems(system.public).includes(
					SystemProtectionFlags.BANNER,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				pronoun_privacy: listFromMaskSystems(system.public).includes(
					SystemProtectionFlags.PRONOUNS,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				member_list_privacy: listFromMaskSystems(system.public).includes(
					SystemProtectionFlags.ALTERS,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				group_list_privacy: listFromMaskSystems(system.public).includes(
					SystemProtectionFlags.TAGS,
				)
					? PrivacyLevel.parse("public")
					: PrivacyLevel.parse("private"),
				front_privacy: PrivacyLevel.parse("private"),
				front_history_privacy: PrivacyLevel.parse("private"),
			},
			webhook_url: null,
			config: {
				timezone: "UTC",
				pings_enabled: true,
				latch_timeout: null,
				member_default_private: false,
				group_default_private: false,
				show_private_info: true,
				member_limit: 1000,
				group_limit: 250,
				case_sensitive_proxy_tags: true,
				proxy_error_message_enabled: true,
				hid_display_split: false,
				hid_display_caps: false,
				hid_list_padding: "off",
				card_show_color_hex: false,
				proxy_switch: "off",
				name_format: null,
				description_templates: [],
			},
			accounts: [system.associatedUserId, ...system.subAccounts],
			members: convertedAlters,
			groups: convertedTags,
			switches: []
		}),
	);
}
