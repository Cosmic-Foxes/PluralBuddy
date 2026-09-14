import { createEvent } from "seyfert";
import { startStatisticalTimer } from "@/analytics";

export default createEvent({
	data: { name: "ready", once: true },
	run: async (user, client) => {
		startStatisticalTimer();
	},
});
