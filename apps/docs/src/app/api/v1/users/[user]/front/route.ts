// AI/AP endpoint

import { authenticateOAuth } from "@/lib/oauth";
import { OAuthClient } from "@better-auth/oauth-provider";
import type { NextRequest } from "next/server";
import { PAlter, PIntegrationFront } from "plurography";
import z from "zod";

const SystemFrontInput = z.object({
	alter: z.string(),
});

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

	if (!oauthResponse.clientId) {
		return Response.json(
			{
				errors: [
					{
						type: "no-client-id",
						friendly:
							"Unable to find the client ID for this OAuth application.",
					},
				],
			},
			{ status: 404 },
		);
	}
    const webDb = oauthResponse.mongo
				.db(`${process.env.ENV}-pluralbuddy-app`)
    const oauthApps = webDb.collection("oauthClient");
    const client = await oauthApps.findOne({ clientId: oauthResponse.clientId })

	if (!client) {
		return Response.json(
			{
				errors: [
					{
						type: "no-ai-ap-id",
						friendly:
							"There is no assigned AI/AP ID which is required to set a front. See https://pb.giftedly.dev/docs/pluralbuddy/ai-ap.",
					},
				],
			},
			{ status: 404 },
		);
	}

	const input = SystemFrontInput.safeParse(
		await request.json().catch(() => ({})),
	);

	if (input.error) {
		return Response.json({ errors: input.error }, { status: 400 });
	}

	const db = oauthResponse.mongo.db(
		`pluralbuddy${process.env.ENV === "canary" ? "-canary" : ""}`,
	);
	const fronts = db.collection<PIntegrationFront>("fronts");
	const alters = db.collection<PAlter>("alters");
	const specifiedAlter = await alters.findOne({
		alterId: Number(input.data.alter ?? ""),
		systemId: oauthResponse.accountId,
	});


	if (!specifiedAlter) {
		return Response.json(
			{
				errors: [
					{
						type: "unknown-alter",
						friendly: "Unable to find the specific alter.",
					},
				],
			},
			{ status: 404 },
		);
	}

	await fronts.replaceOne(
		{
			clientId: oauthResponse.clientId,
			systemId: oauthResponse.accountId,
		},
		{
			clientId: oauthResponse.clientId,
			systemId: oauthResponse.accountId,
			alterId: input.data.alter,
			timestamp: new Date(),
			aiapId: client.metadata.aaid,
		},
		{ upsert: true },
	);

    return Response.json(
        { success: true }
    )
}
