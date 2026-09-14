import { createEvent } from "seyfert";
import { startStatisticalTimer } from "@/analytics";
import { initializeApplicationCommands } from "@/lib/mention-command";

export default createEvent({
	data: { name: "ready", once: false },
	run: async (user, client) => {
        await initializeApplicationCommands();
		startStatisticalTimer();
    }

});
