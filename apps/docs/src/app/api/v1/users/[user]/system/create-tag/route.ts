import { authenticateOAuth } from "@/lib/oauth";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { type NextRequest, NextResponse } from "next/server";
import { type PTag, PTagObject, type PUser, tagColors } from "plurography";
import z from "zod";

const CreateTagParams = z.object({
	color: z.enum(tagColors),
	displayName: z.string().max(100).min(3),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ user: string }> },
) {
	const { user } = await params;
	const input = CreateTagParams.safeParse(await request.json());

	if (input.error) {
		return Response.json(
			{ errors: [{ type: "zod", friendly: input.error }] },
			{ status: 400 },
		);
	}

	const oauthResponse = await authenticateOAuth(request, [
		"tags:write",
		"system:admin",
	]);

	if ("response" in oauthResponse) return oauthResponse.response;

	const parsedUserId = user === "@me" ? oauthResponse.accountId : user;
	const db = oauthResponse.mongo.db(
		`pluralbuddy${process.env.ENV === "canary" ? "-canary" : ""}`,
	);
	const [userCollection, alterCollection] = [
		db.collection<PUser>("users"),
		db.collection<PTag>("tags"),
	];

	if (parsedUserId !== oauthResponse.accountId) {
		return Response.json(
			{
				errors: [
					{
						type: "not-matching-oauth",
						friendly:
							"This endpoint requires the user currently logged in via OAuth.",
					},
				],
			},
			{ status: 400 },
		);
	}

	const userObj = await userCollection.findOne({
		userId: oauthResponse.accountId,
	});

	if (!userObj || !userObj.system || userObj.system.tagIds.length >= 1000) {
		return Response.json(
			{
				errors: [
					{
						type: "too-many-tags",
						friendly: "There are too many tags in the system or it doesn't exist.",
					},
				],
			},
			{ status: 400 },
		);
	}

	const tag = PTagObject.safeParse({
		tagId: Number(DiscordSnowflake.generate()).toString(),
		systemId: userObj.system.associatedUserId,

		tagFriendlyName: input.data.displayName,
		tagColor: input.data.color,

		associatedAlters: [],

		/** @see {@link TagProtectionFlags} */
		public: 0,
	});

	if (!tag.data || tag.error) {
		return Response.json(
			{
				errors: [
					{
						type: "zod",
						friendly: input.error,
					},
				],
			},
			{ status: 400 },
		);
	}

	await Promise.allSettled([
		alterCollection.insertOne(tag.data),
		userCollection.updateOne(
			{ userId: oauthResponse.accountId },
			{ $push: { "system.tagIds": tag.data.tagId } },
		),
	]);

	return NextResponse.json({ success: true });
}
