/**  * PluralBuddy Discord Bot  *  - is licensed under MIT License.  */

import { createOAuthFunction } from "@/server/wrapper";

export const GET = createOAuthFunction<{ user: string }>(
	{
		scopes: ["system:read", "system:admin"],
		mustMatchOAuth: true,
	},
	async (ctx) => {
		const system = await ctx.fetchUser();

		return ctx.respond({ data: system?.system ?? null });
	},
);
