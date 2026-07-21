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

export type SpecificAlterInputItem = "username" | "display_name" | "all";
export type EqualTypeInputItem = "contains" | "is" | "is_lc";

const inputItems = [
	{ label: "Username", value: "username" },
	{ label: "Display Name", value: "display_name" },
	{ label: "All Alters", value: "all" },
];

const equalsTypesItems = [
	{ label: "contains", value: "contains" },
	{ label: "is", value: "is" },
	{ label: "is lowercase", value: "is_lc" },
];

export function SpecifcAltersFilterNode(props: {
	data: { inputItem: SpecificAlterInputItem; equalType: EqualTypeInputItem };
}) {
	return (
		<NodeTemplate>
			<div className="w-[300px] flex items-center border rounded-lg bg-background">
				<div className="gap-y-2">
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
					<strong className="block text-lg">If alter</strong>
					<p className="text-sm">Filter out specific alters from the system.</p>
					<Select>
						<SelectTrigger className="w-full mt-4">
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
