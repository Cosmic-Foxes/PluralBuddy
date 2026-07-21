import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Handle, Position } from "@xyflow/react";
import { NodeTemplate } from "./node-template";
import { Callout } from "@/components/callout";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type SpecificAlterInputItem = "username" | "display_name" | "all";
export type EqualTypeInputItem = "contains" | "is" | "is_lc";

const inputItems = [
	{ label: "Group/Tag ID", value: "id" },
	{ label: "Name", value: "name" },
	{ label: "Display Name", value: "display_name" },
];

const equalsTypesItems = [
	{ label: "contains", value: "contains" },
	{ label: "is", value: "is" },
	{ label: "is lowercase", value: "is_lc" },
];

export function SpecifcAltersTagFilterNode(props: {
	data: { inputItem: SpecificAlterInputItem; equalType: EqualTypeInputItem };
}) {
	const [expandWarning, setExpandWarning] = useState(false);
	return (
		<NodeTemplate>
			<div className="w-[300px] flex items-start border rounded-lg bg-background transition-all">
				<div className="gap-y-2 mt-18.5">
					<div className="block">
						<Handle
							type="source"
							position={Position.Left}
							id="output_true"
							style={{ top: 88 }}
						/>
						<label
							htmlFor="output_true"
							className="mr-[10px] font-mono uppercase text-right text-sm ml-2"
						>
							True
						</label>
					</div>
					<div className="block">
						<Handle
							type="source"
							position={Position.Left}
							id="output_false"
							style={{ top: 112 }}
						/>
						<label
							htmlFor="output_true"
							className="mr-[10px] font-mono uppercase text-right text-sm ml-2"
						>
							Else
						</label>
					</div>
				</div>
				<div className="p-2 block text-left min-w-[200px]">
					<code className="uppercase text-sm">Filter</code>
					<strong className="block text-lg">If alter has group/tag</strong>
					<p className="text-sm">
						Filter out specific alters with a corresponding group/tag from the
						flow.
					</p>
					<Callout className="text-xs">
						{!expandWarning ? (
							<button className="cursor-pointer whitespace-normal" onClick={() => setExpandWarning(true)} type="button">Click to expand this warning</button>
						) : (
							`The tag which matches the criteria specified below will be the filter for the alters. If no tag is selected, all alters will be matched as ELSE.`
						)}
					</Callout>
					<Select>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Selectors</SelectLabel>
								{inputItems.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
					<div className="flex items-center gap-1 mt-2">
						<Select>
							<SelectTrigger className="w-min">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Selecting Type</SelectLabel>
									{equalsTypesItems.map((item) => (
										<SelectItem key={item.value} value={item.value}>
											{item.label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<Input className="w-full" />
					</div>
				</div>
				<Handle type="target" position={Position.Right} id="data" />
			</div>
		</NodeTemplate>
	);
}
