/**  * PluralBuddy Discord Bot  *  - is licensed under MIT License.  */

import { defaultUserStructure, type PUser } from "plurography";
import { userCollection } from "../mongodb";

export { defaultUserStructure, type PUser, PUserObject } from "plurography";

export const terminologyMemoryCache: Record<string, string> = {};

export async function getUserById(id: string): Promise<PUser> {
	const user = await userCollection.findOne({ userId: id });
	const defaultNudgingStructure = {
		blockedUsers: [],
		currentlyEnabled: true,
		dmReply: false,
		...(user?.nudging ?? {}),
	};

	return user
		? { ...user, nudging: defaultNudgingStructure }
		: defaultUserStructure(id);
}

export async function writeUserById(id: string, userObj: PUser) {
	return await userCollection.findOneAndReplace({ userId: id }, userObj, {
		upsert: true,
	});
}
