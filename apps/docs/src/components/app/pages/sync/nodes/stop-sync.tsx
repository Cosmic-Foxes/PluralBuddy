import { Handle, Position } from "@xyflow/react";
import { NodeTemplate } from "./node-template";
import { SystemNodeTemplate } from "./system";

export function StopSyncNode() {
	return (
		<NodeTemplate>
			<div className="w-[300px] flex items-start border rounded-lg bg-background transition-all">
				<Handle type="target" position={Position.Right} id="stop" />
				<div className="p-2 block text-left min-w-[200px]">
					<code className="uppercase text-sm">Control</code>
					<strong className="block text-lg">Stop syncing</strong>
					<p className="text-sm">
						Completely stops sync execution when this block is ran.
					</p>
				</div>
			</div>
		</NodeTemplate>
	);
}
