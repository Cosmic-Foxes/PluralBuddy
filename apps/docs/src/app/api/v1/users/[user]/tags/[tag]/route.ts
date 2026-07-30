/**  * PluralBuddy Discord Bot  *  - is licensed under MIT License.  */

import { auth } from "@/lib/auth";
import { authenticateOAuth } from "@/lib/oauth";
import { redactAlter, redactTag } from "@/lib/redact";
import { MongoClient } from "mongodb";
import { NextRequest } from "next/server";
import { PAlter, PTag, PUser } from "plurography";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ user: string; tag: string }> },
) {
	const { user, tag } = await params;

	const oauthResponse = await authenticateOAuth(request, [
		"tags:read",
		"system:admin",
	]);

	if ("response" in oauthResponse) return oauthResponse.response;

	auth.api.oauth2Token()

	const parsedUserId = user === "@me" ? oauthResponse.accountId : user;
	const db = oauthResponse.mongo.db(`pluralbuddy${process.env.ENV === "canary" ? "-canary" : ""}`);
	const tagCollection = db.collection<PTag>("tags");
	const isSelf = user === "@me" || user === oauthResponse.accountId;
	const response = await tagCollection.findOne({
		tagId: tag,
		systemId: parsedUserId,
	});

	await oauthResponse.mongo.close();
	return Response.json({
		isSelf,
		data: redactTag(isSelf, response, oauthResponse.clientId ?? ""),
	});
}


export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ user: string; tag: string }> },
) {
	const { user, tag } = await params;

	const oauthResponse = await authenticateOAuth(request, [
		"tags:write",
		"system:admin",
	]);

	if ("response" in oauthResponse) return oauthResponse.response;

	const parsedUserId = user === "@me" ? oauthResponse.accountId : user;
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

	const db = oauthResponse.mongo.db(
		`pluralbuddy${process.env.ENV === "canary" ? "-canary" : ""}`,
	);
	const [userCollection, tagCollection] = [
		db.collection<PUser>("users"),
		db.collection<PTag>("tags"),
	];
	const [userObj, alterObj] = await Promise.all([
		userCollection.findOne({
			userId: oauthResponse.accountId,
		}),
		tagCollection.findOne({
			tagId: tag,
			systemId: oauthResponse.accountId,
		}),
	]);

	if (!userObj || !userObj.system || !alterObj) {
		return Response.json(
			{
				errors: [
					{
						type: "no-system-tag",
						friendly: "This system or tag doesn't exist.",
					},
				],
			},
			{ status: 400 },
		);
	}

	await tagCollection.deleteOne({
		tagId: tag,
		systemId: oauthResponse.accountId,
	});

	return Response.json({ success: true })
}
