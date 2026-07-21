import { Handle, Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { NodeTemplate } from "./node-template";
import { Input } from "@/components/ui/input";

export function LogTextNode({ id, data }: NodeProps<Node<{ text: string }>>) {
	const { updateNodeData } = useReactFlow();

	return (
		<NodeTemplate>
			<div className="w-[300px] flex items-start border rounded-lg bg-background transition-all">
				<Handle type="source" position={Position.Left} id="log_in" />
				<Handle type="target" position={Position.Right} id="log_out" />
				<div className="p-2 block text-left w-full min-w-[200px]">
					<code className="uppercase text-sm">Control</code>
					<strong className="block text-lg">Log text</strong>
					<p className="text-sm">Log text to the syncing log.</p>
					<Input
						placeholder="Text to add to log"
						className="mt-2"
						value={data.text ?? ""}
						onChange={(evt) => updateNodeData(id, { text: evt.target.value })}
					/>
				</div>
			</div>
		</NodeTemplate>
	);
}
