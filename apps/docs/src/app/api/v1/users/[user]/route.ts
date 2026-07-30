/**  * PluralBuddy Discord Bot  *  - is licensed under MIT License.  */

import { auth } from "@/lib/auth";
import { APIError, verifyAccessToken } from "better-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ user: string }> },
) {
	const authorization = request.headers.get("authorization");
	const accessToken = authorization?.startsWith("Bearer ")
		? authorization.replace("Bearer ", "")
		: authorization;

	if (!accessToken) {
		return NextResponse.json(
			{
				errors: [
					{ type: "unknown-auth", friendly: "authorization header not found" },
				],
			},
			{ status: 405 },
		);
	}

	const { user } = await params;
	if (user !== "@me") {
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

	try {
		const userInfo = await auth.api.oauth2UserInfo({
			request,
		});

		return Response.json(userInfo);
	} catch (e) {
		return Response.json(
			{
				errors: [
					{
						type: "user-info",
						friendly: (e as APIError).body?.error_description,
					},
				],
			},
			{ status: (e as APIError).statusCode },
		);
	}
}
