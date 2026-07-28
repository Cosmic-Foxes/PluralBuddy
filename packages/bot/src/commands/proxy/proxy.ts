import { AutoLoad, Command, Declare } from "seyfert";

@Declare({
    name: "proxy",
    description: "Set autoproxy settings",
    contexts: ["Guild"]
})
@AutoLoad()
export default class ProxyCommand extends Command { }