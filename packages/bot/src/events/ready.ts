import { createEvent } from "seyfert";
import { startStatisticalTimer } from "@/analytics";
import { initializeApplicationCommands } from "@/lib/mention-command";
import { analyticsCollection } from "@/mongodb";

export default createEvent({
	data: { name: "ready", once: false },
	run: async (user, client) => {
		await initializeApplicationCommands();
		if (analyticsCollection !== undefined) startStatisticalTimer();
	},
});
