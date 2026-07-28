import { runStatusCommand } from "@/lib/ap-cmds/status";
import { alterCollection } from "@/mongodb";
import { AlertView } from "@/views/alert";
import { AlterView } from "@/views/alters";
import {
    CommandContext,
    Container,
    Declare,
    IgnoreCommand,
    Options,
    Separator,
    SubCommand,
    TextDisplay,
} from "seyfert";
import type { ColorResolvable } from "seyfert/lib/common";
import { MessageFlags } from "seyfert/lib/types";

@Declare({
    name: "status",
    description: "Get the status of the current auto-proxy",
    aliases: ["s"],
    contexts: ["Guild"],
    ignore: IgnoreCommand.Message
})
export default class StatusAutoProxy extends SubCommand {
    override async run(ctx: CommandContext) {
        return await runStatusCommand(ctx, false);
    }
}