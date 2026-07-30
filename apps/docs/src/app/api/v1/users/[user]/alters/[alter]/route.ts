/**  * PluralBuddy Discord Bot  *  - is licensed under MIT License.  */

import { auth } from "@/lib/auth";
import { authenticateOAuth } from "@/lib/oauth";
import { redactAlter } from "@/lib/redact";
import { MongoClient } from "mongodb";
import { NextRequest } from "next/server";
import { PAlter, PUser } from "plurography";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ user: string; alter: string }> },
) {
	const { user, alter } = await params;

	const oauthResponse = await authenticateOAuth(request, [
		"alters:read",
		"system:admin",
	]);

	if ("response" in oauthResponse) return oauthResponse.response;

	const parsedUserId = user === "@me" ? oauthResponse.accountId : user;
	const db = oauthResponse.mongo.db(
		`pluralbuddy${process.env.ENV === "canary" ? "-canary" : ""}`,
	);
	const alterCollection = db.collection<PAlter>("alters");
	const isSelf = user === "@me" || user === oauthResponse.accountId;
	const response = await alterCollection.findOne({
		alterId: Number(alter),
		systemId: parsedUserId,
	});

	await oauthResponse.mongo.close();
	return Response.json({
		isSelf,
		data: redactAlter(isSelf, response, oauthResponse.clientId ?? ""),
	});
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ user: string; alter: string }> },
) {
	const { user, alter } = await params;

	const oauthResponse = await authenticateOAuth(request, [
		"alters:write",
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
	const [userCollection, alterCollection] = [
		db.collection<PUser>("users"),
		db.collection<PAlter>("alters"),
	];
	const [userObj, alterObj] = await Promise.all([
		userCollection.findOne({
			userId: oauthResponse.accountId,
		}),
		alterCollection.findOne({
			alterId: Number(alter),
			systemId: oauthResponse.accountId,
		}),
	]);

	if (!userObj || !userObj.system || !alterObj) {
		return Response.json(
			{
				errors: [
					{
						type: "no-system-alter",
						friendly: "This system or alter doesn't exist.",
					},
				],
			},
			{ status: 400 },
		);
	}

	await alterCollection.deleteOne({
		alterId: Number(alter),
		systemId: oauthResponse.accountId,
	});

	return Response.json({ success: true })
}
