import { InteractionIdentifier } from "@/lib/interaction-ids";
import { ComponentCommand, type ComponentContext } from "seyfert";

export default class PluralKitExternalExporting extends ComponentCommand {
    componentType = 'StringSelect' as const;

    override filter(ctx: ComponentContext<typeof this.componentType>) {
        return InteractionIdentifier.Systems.ExternalExporting.PluralKit.equals(ctx.customId)  
    }

    async run(ctx: ComponentContext<typeof this.componentType>) {
    }
}