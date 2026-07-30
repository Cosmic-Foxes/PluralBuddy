import { authenticateOAuth } from "@/lib/oauth";
import { api } from "@/lib/rpc";
import { waitUntil } from "@vercel/functions";
import { NextRequest } from "next/server";
import { PAlter, PAlterObject, PSystemObject, PUser } from "plurography";
import z from "zod";

const AlterEditInput = PAlterObject.omit({
	tagIds: true,
	alterId: true,
	systemId: true,
	created: true,
	lastMessageTimestamp: true,
	messageCount: true,
})
	.partial()
	.default({});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ user: string; alter: string }> },
) {
	const { user, alter } = await params;
	const input = AlterEditInput.safeParse(await request.json());

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
			{ status: 400 },
		);
	}


	const { data } = input;
	const db = oauthResponse.mongo.db(
		`pluralbuddy${process.env.ENV === "canary" ? "-canary" : ""}`,
	);
	const alterCollection = db.collection<PAlter>("alters");
	const alterObj = await alterCollection.findOne({
		$and: [{ systemId: oauthResponse.accountId }, { alterId: Number(alter) }],
	});

	if (!alterObj) {
		return Response.json(
			{
				errors: [
					{ type: "unknown-alter", friendly: "Couldn't find this alter." },
				],
			},
			{ status: 404 },
		);
	}
	const { fields, ...omittedData } = data;

	await Promise.allSettled([
		alterCollection.updateOne(
			{
				$and: [
					{ systemId: oauthResponse.accountId },
					{ alterId: Number(alter) },
				],
			},
			{
				$set: Object.assign(
					{},
					...Object.entries(omittedData).map(([v, c]) => ({
						// @ts-ignore
						[v]: c ?? alterObj?.[v],
					})),
				),
			},
		),
		...(fields !== undefined &&
		fields[oauthResponse.clientId ?? ""] !== undefined
			? [
					alterCollection.updateOne(
						{
							$and: [
								{ systemId: oauthResponse.accountId },
								{ alterId: Number(alter) },
							],
						},
						{
							$set: {
								[`fields.${oauthResponse.clientId}`]:
									fields[oauthResponse.clientId ?? ""],
							},
						},
					),
				]
			: []),
	]);

	waitUntil(oauthResponse.mongo.close());

	return Response.json({
		...alterObj,

		...Object.assign(
			{},
			...Object.entries(data).map(([v, c]) => ({
				// @ts-ignore
				[v]: c ?? alterObj?.[v],
			})),
		),
	});
}
