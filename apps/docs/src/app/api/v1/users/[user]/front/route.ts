// AI/AP endpoint

import { authenticateOAuth } from "@/lib/oauth";
import type { NextRequest } from "next/server";
import z from "zod";

const SystemFrontInput = z.object({
    alter: z.string()
})

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ user: string }> },
) {
	const { user } = await params;

	const oauthResponse = await authenticateOAuth(request, ["system:ai-ap"]);

	if ("response" in oauthResponse) return oauthResponse.response;

	if (user !== oauthResponse.accountId && user !== "@me") {
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
			{ status: 404 },
		);
	}

	const input = SystemFrontInput.safeParse(await request.json());

	if (input.error) {
		return Response.json({ errors: input.error }, { status: 400 });
	}

}
