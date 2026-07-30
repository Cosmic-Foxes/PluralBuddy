import { authenticateOAuth } from "@/lib/oauth";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { NextRequest, NextResponse } from "next/server";
import { PAlter, PAlterObject, PUser } from "plurography";
import z from "zod";

const CreateAlterParams = z.object({
	username: z
		.string()
		.max(100)
		.regex(/^[^\s@\\/]+$/),
	displayName: z.string().max(100),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ user: string }> },
) {
	const { user } = await params;
	const input = CreateAlterParams.safeParse(await request.json());

	if (input.error) {
		return Response.json(
			{ errors: [{ type: "zod", friendly: input.error }] },
			{ status: 400 },
		);
	}

	const oauthResponse = await authenticateOAuth(request, [
		"alters:write",
		"system:admin",
	]);

	if ("response" in oauthResponse) return oauthResponse.response;

	const parsedUserId = user === "@me" ? oauthResponse.accountId : user;
	const db = oauthResponse.mongo.db(
		`pluralbuddy${process.env.ENV === "canary" ? "-canary" : ""}`,
	);
	const [userCollection, alterCollection] = [
		db.collection<PUser>("users"),
		db.collection<PAlter>("alters"),
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

	const [userObj, alterObj] = await Promise.all([
		userCollection.findOne({
			userId: oauthResponse.accountId,
		}),
		alterCollection.findOne({
			username: input.data.username,
			systemId: oauthResponse.accountId,
		}),
	]);

	if (!userObj || !userObj.system || userObj.system.alterIds.length >= 2000) {
		return Response.json(
			{
				errors: [
					{
						type: "too-many-alters",
						friendly: "There are too many alters in the system.",
					},
				],
			},
			{ status: 400 },
		);
	}

	if (alterObj) {
		return Response.json(
			{
				errors: [
					{
						type: "duplicate",
						friendly: "There is a duplicate alter with this username.",
					},
				],
			},
			{ status: 400 },
		);
	}

	const alter = PAlterObject.safeParse({
		alterId: Number(DiscordSnowflake.generate()),
		systemId: userObj.userId,

		username: input.data.username,
		displayName: input.data.displayName,
		nameMap: [],
		color: null,
		pronouns: null,
		description: null,
		created: new Date(),
		avatarUrl: null,
		webhookAvatarUrl: null,
		banner: null,
		lastMessageTimestamp: null,
		messageCount: 0,
		alterMode: "webhook",
		public: 0,
	});

	if (!alter.data || alter.error) {
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
		alterCollection.insertOne(alter.data),
		userCollection.updateOne(
			{ userId: oauthResponse.accountId },
			{ $push: { "system.alterIds": alter.data.alterId } },
		),
	]);

	return alter.data;
}
