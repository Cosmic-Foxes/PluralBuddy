import { InteractionIdentifier } from "@/lib/interaction-ids";
import { userCollection } from "@/mongodb";
import { ComponentCommand, ModalCommand, ModalContext, type ComponentContext } from "seyfert";

export default class AcceptPolicy extends ModalCommand {

    override filter(context: ModalContext) {
        return InteractionIdentifier.PolicyForm.startsWith(context.customId ?? "");
    }

    override async run(ctx: ModalContext) {
        await userCollection.updateOne({userId: ctx.author.id}, { $set: { policyStatus: 1 }}, { upsert: true })
        const newCustomId = InteractionIdentifier.PolicyForm.substring(ctx.customId ?? "").join("-");

        return ctx.client.components.commands.map(async(c) => {
            if (await c.filter?.({...ctx, customId: newCustomId, values: ["","","",""]} as unknown as ModalContext & ComponentContext<never>)) {
                console.log("found")
                return await c.run(ctx as ModalContext & ComponentContext<never>)
            }
            return null;
        })
    }
}