import { initializeApplicationCommands } from "@/lib/mention-command";
import { createEvent } from "seyfert";

export default createEvent({
	data: { name: "ready", once: false },
	run: async (user, client) => {
        await initializeApplicationCommands();

		
		setInterval(async () => {
		  client.logger.info(await client.cache.guilds?.count())
		}, 5000)
    }

});
