import { authenticateOAuth } from "@/lib/oauth";
import type { NextRequest } from "next/server";
import type { PTag } from "plurography";

export async function GET(
	request: NextRequest,
	{
		params,
	}: {
		params: Promise<{ id: string; user: string }>;
	},
) {
	const { id, user } = await params;

	const oauthResponse = await authenticateOAuth(request, [
		"alters:read",
		"system:admin",
	]);

	if ("response" in oauthResponse) return oauthResponse.response;

	const parsedUserId = user === "@me" ? oauthResponse.accountId : user;
	const db = oauthResponse.mongo.db(
		`pluralbuddy${process.env.ENV === "canary" ? "-canary" : ""}`,
	);
	const tagCollection = db.collection<PTag>("tags");

	if (parsedUserId !== oauthResponse.accountId && user !== "@me") {
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

	const tag = await tagCollection.findOne({
		[`fields.${oauthResponse.clientId}`]: id,
		systemId: oauthResponse.accountId,
	});

	return tag;
}
