import { Button } from "@/components/ui/shadcn-button";
import { Handle, NodeToolbar, Position, useNodeConnections, useNodeId, useReactFlow } from "@xyflow/react";
import { Book, Pencil, Trash } from "lucide-react";
import { JSX } from "react";
import { NodeTemplate } from "./node-template";
import { cn } from "@/lib/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SystemNodeTemplate({ children }: { children: JSX.Element }) {
	const connections = useNodeConnections()
	const nodeId = useNodeId();

	console.log(connections)

	return (
		<NodeTemplate>
			<div className="flex w-[230px] items-center border rounded-lg bg-background transition-all">
				<div className="pl-2 pr-2">
					<Tooltip>
						<TooltipTrigger>
					<Book className={cn("size-4 transition-all", connections.some(v => v.sourceHandle === "read" && v.source === nodeId) ? "" : "text-muted-foreground")} />
						</TooltipTrigger>
						<TooltipContent>In PluralBuddy Connections, the read icon always connects to a write icon. Connect this to a pencil on another system to allow data from this system to write that system.</TooltipContent>
						</Tooltip>
				</div>
				{children}
				<div className="pr-2 pl-2">
					<Tooltip>
						<TooltipTrigger>
					<Pencil className={cn("size-4 transition-all", connections.some(v => v.targetHandle === "write" && v.target === nodeId) ? "" : "text-muted-foreground")} /></TooltipTrigger>
					<TooltipContent>In PluralBuddy Connections, the write icon always connects to a read icon. Connect this to a book on another system to allow data from that system to write to this one.</TooltipContent>
				</Tooltip>
				</div>
				<Handle type="target" position={Position.Right} id="write" />
				<Handle type="source" position={Position.Left} id="read" />
			</div>
		</NodeTemplate>
	);
}
