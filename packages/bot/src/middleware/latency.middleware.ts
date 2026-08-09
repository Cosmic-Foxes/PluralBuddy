import { latencyDataPoints } from "@/analytics";
import { createMiddleware } from "seyfert";

export const latency = createMiddleware<void>(async (middle) => {
	if (!middle.context.guildId) return middle.next();
	latencyDataPoints.push(
		Date.now() -
			// @ts-ignore
			(middle.context.message ?? middle.context.interaction).createdTimestamp,
	);

	return middle.next();
});
