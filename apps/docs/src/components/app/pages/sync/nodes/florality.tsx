import { Button } from "@/components/ui/shadcn-button";
import { Handle, Position, useNodeId, useNodes, useNodesData, useReactFlow } from "@xyflow/react";
import { CircleQuestionMark, Settings } from "lucide-react";
import { SystemNodeTemplate } from "./system";

export function FloralitySystemNode(props: {
	data: { members: number | undefined; groups: number | undefined };
}) {
  
	return (
		<SystemNodeTemplate>
			<div className="p-2 block text-left w-[calc(100%-70px)]">
				<code className="uppercase text-sm">System</code>
				<strong className="block text-lg">Florality</strong>
				<div className="flex items-center justify-between pt-1">
					<div>Members</div>
					<code>
						{props.data.members ?? <CircleQuestionMark className="size-4" />}
					</code>
				</div>
				<div className="flex items-center justify-between">
					<div>Groups</div>
					<code>
						{props.data.groups ?? <CircleQuestionMark className="size-4" />}
					</code>
				</div>
				<div className="flex items-center gap-1 mt-3">
					<Button className="w-full">Link</Button>
					<Button variant="secondary">
						<Settings className="size-4" />
					</Button>
				</div>
			</div>
		</SystemNodeTemplate>
	);
}
