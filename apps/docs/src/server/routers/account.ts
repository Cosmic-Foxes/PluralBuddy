import { MongoClient, ObjectId } from "mongodb";
import { baseProcedure, createTRPCRouter } from "../init";
import { PMessage, PUser } from "plurography";
import { getDiscordIdBySessionId } from "@/lib/discord-id";
import z from "zod";
import { OAuthClient } from "@better-auth/oauth-provider";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const AccountRouter = createTRPCRouter({
	getAccountSettings: baseProcedure.query(async ({ ctx }) => {
		const session = ctx.session;

		if (!session) throw new Error("Session error.");

		const client = new MongoClient(process.env.MONGO ?? "");
		await client.connect();

		const db = client.db(
			`pluralbuddy${process.env.ENV === "canary" ? "-canary" : ""}`,
		);
		const users = db.collection<PUser>("users");
		const owner = await getDiscordIdBySessionId(session.user.id);
		const systemUser = await users.findOne({ userId: owner });

		if (!systemUser || !systemUser.system) return { noSystem: true };

		return {
			username: ctx.session?.user.name,
			systemName: systemUser.system.systemName,
			systemPronouns: systemUser.system.systemPronouns,
		};
	}),

	updateAccountSettings: baseProcedure
		.input(
			z.object({
				systemName: z.string().max(100).min(1),
				systemPronouns: z.string().max(100).min(1).optional().nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const session = ctx.session;

			if (!session) throw new Error("Session error.");

			const client = new MongoClient(process.env.MONGO ?? "");
			await client.connect();

			const db = client.db(
				`pluralbuddy${process.env.ENV === "canary" ? "-canary" : ""}`,
			);
			const users = db.collection<PUser>("users");
			const owner = await getDiscordIdBySessionId(session.user.id);
			const systemUser = await users.findOne({ userId: owner });

			if (!systemUser || !systemUser.system) return { noSystem: true };

			await users.updateOne(
				{
					userId: owner,
				},
				{
					$set: {
						"system.systemName": input.systemName,
						"system.systemPronouns": input.systemPronouns,
					},
				},
			);

			return { success: true };
		}),

	destructiveStats: baseProcedure.query(async ({ ctx }) => {
		const session = ctx.session;

		if (!session) throw new Error("Session error.");

		const client = new MongoClient(process.env.MONGO ?? "");
		await client.connect();

		const db = client.db(
			`pluralbuddy${process.env.ENV === "canary" ? "-canary" : ""}`,
		);
		const users = db.collection<PUser>("users");
		const messages = db.collection<PMessage>("messages");
		const owner = await getDiscordIdBySessionId(session.user.id);
		const systemUser = await users.findOne({ userId: owner });

		return {
			alterCount: systemUser?.system?.alterIds.length ?? 0,
			tagCount: systemUser?.system?.tagIds.length ?? 0,
			messageCount: await messages.countDocuments({ systemId: owner }),
			oauthClients:
				(
					await auth.api.getOAuthClients({
						headers: await headers(),
					})
				)?.length ?? 0,
		};
	}),

	deleteAccount: baseProcedure.mutation(async ({ ctx }) => {
		const session = ctx.session;

		if (!session) throw new Error("Session error.");

		const client = new MongoClient(process.env.MONGO ?? "");
		await client.connect();

		await auth.api.deleteUser({
			body: {},
			headers: await headers()
		})

		return { success: true }
	}),
});
