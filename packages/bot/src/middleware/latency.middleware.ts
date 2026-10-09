import { addBreadcrumb } from "@sentry/bun";
import { createMiddleware } from "seyfert";
import { latencyDataPoints } from "@/analytics";

export const latency = createMiddleware<void>(async (middle) => {
	if (!middle.context.guildId) return middle.next();
	latencyDataPoints.push(
		Date.now() -
			// @ts-ignore
			(middle.context.message ?? middle.context.interaction).createdTimestamp,
	);
	addBreadcrumb({
		category: "components",
		message: `Handling component/command: ${middle.context.isComponent() || middle.context.isModal() ? middle.context.customId : middle.context.fullCommandName}`,
		level: "info",
	});

	return middle.next();
});
