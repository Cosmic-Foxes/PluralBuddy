import { Button } from "@/components/ui/shadcn-button";
import { Handle, NodeToolbar, Position, useNodeId, useReactFlow } from "@xyflow/react";
import { Book, Pencil, Trash } from "lucide-react";
import { JSX } from "react";
import { NodeTemplate } from "./node-template";

export function SystemNodeTemplate({ children }: { children: JSX.Element }) {
	const flow = useReactFlow();
	const nodeId = useNodeId();

	return (
		<NodeTemplate>
			<div className="flex w-[230px] items-center border rounded-lg bg-background">
				<div className="pl-2 pr-2">
					<Book className="size-4" />
				</div>
				{children}
				<div className="pr-2 pl-2">
					<Pencil className="size-4" />
				</div>
				<Handle type="target" position={Position.Right} id="write" />
				<Handle type="source" position={Position.Left} id="read" />
			</div>
		</NodeTemplate>
	);
}
