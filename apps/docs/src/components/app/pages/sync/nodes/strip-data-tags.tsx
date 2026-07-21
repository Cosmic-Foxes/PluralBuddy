import { Book } from "lucide-react";
import { NodeTemplate } from "./node-template";
import { SystemNodeTemplate } from "./system";
import { Handle, Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Discord } from "@/components/ui/svgs/discord";

import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
} from "@/components/ui/combobox";
import { useState } from "react";

const inputItems = [
	{ label: "Description", value: "description" },
	{ label: "Privacy Flags", value: "privacy" },
];

export function StripTagDataNode({ id, data }: NodeProps<Node<{ value: string[] }>>) {
	const flow = useReactFlow();

	return (
		<NodeTemplate>
			<div className="flex w-[280px] items-center border rounded-lg bg-background transition-all">
				<div className="p-2 block text-left w-full">
					<code className="uppercase text-sm">Data Manipulation</code>
					<strong className="block text-lg">
						Strip tag data from system
					</strong>
					<p className="text-sm">
						Remove certain data fields from tag data that is input.
					</p>
					<Combobox
						items={inputItems}
						multiple
						value={data.value ?? []}
						onValueChange={(value) => flow.updateNodeData(id, { value })}
					>
						<ComboboxChips>
							<ComboboxValue>
								{(data.value ?? []).map((item) => (
									<ComboboxChip key={item}>{inputItems.find(v => v.value === item)?.label}</ComboboxChip>
								))}
							</ComboboxValue>
							<ComboboxChipsInput placeholder="Add key" />
						</ComboboxChips>
						<ComboboxContent>
							<ComboboxEmpty>No items found.</ComboboxEmpty>
							<ComboboxList>
								{(item) => (
									<ComboboxItem key={item.value} value={item.value}>
										{item.label}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</div>
				<Handle type="target" position={Position.Right} id="input" />
				<Handle type="source" position={Position.Left} id="output" />
			</div>
		</NodeTemplate>
	);
}
