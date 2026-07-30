import { authenticateOAuth } from "@/lib/oauth";
import { NextResponse, type NextRequest } from "next/server";
import type { PAlter } from "plurography";

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
	const alterCollection = db.collection<PAlter>("alters");

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

	const alter = await alterCollection.findOne({
		[`fields.${oauthResponse.clientId}`]: id,
	});

	return NextResponse.json(alter);
}
