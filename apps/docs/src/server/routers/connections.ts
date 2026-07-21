import { PAlter, PTag, PUser } from "plurography";
import { baseProcedure } from "../init";
import { router } from "../trpc";
import { MongoClient } from "mongodb";
import { getDiscordIdBySessionId } from "@/lib/discord-id";

export const ConnectionsRouter = router({
	getSystemMetadata: baseProcedure.query(async ({ ctx }) => {
		const session = ctx.session;

		if (!session) throw new Error("Session error.");
		const client = new MongoClient(process.env.MONGO ?? "");
		await client.connect();

		const db = client.db(
			`pluralbuddy${process.env.ENV === "canary" ? "-canary" : ""}`,
		);           

        const owner = await getDiscordIdBySessionId(session.user.id);
		const alters = db.collection<PAlter>("alters");
		const tags = db.collection<PTag>("tags");
        const users = db.collection<PUser>("users")

        return {
            systemExists: (await users.findOne({ userId: owner })) !== undefined,
            alters: await alters.countDocuments({ systemId: owner }),
            tags: await tags.countDocuments({ systemId: owner })
        }
	}),
});
