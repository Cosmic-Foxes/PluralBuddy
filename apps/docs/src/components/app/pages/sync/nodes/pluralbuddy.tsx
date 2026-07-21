import { Handle, Position } from "@xyflow/react";
import { Book, Pencil } from "lucide-react";
import { SystemNodeTemplate } from "./system";

export function PluralBuddySystemNode(props: {
	data: { alters: number; tags: number };
}) {
	return (
		<SystemNodeTemplate>
			<div className="p-2 block text-left w-full">
				<code className="uppercase text-sm">System</code>
				<strong className="block text-lg">PluralBuddy</strong>
				<div className="flex items-center justify-between pt-1">
					<div>Alters</div>
					<code>{props.data.alters}</code>
				</div>
				<div className="flex items-center justify-between">
					<div>Tags</div>
					<code>{props.data.tags}</code>
				</div>
			</div>
		</SystemNodeTemplate>
	);
}
