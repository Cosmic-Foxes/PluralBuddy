import { Button } from "@/components/ui/shadcn-button";
import { NodeToolbar, useNodeId, useReactFlow } from "@xyflow/react";
import { Trash } from "lucide-react";
import { JSX } from "react";
import { motion } from "motion/react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export function NodeTemplate({ children }: { children: JSX.Element }) {
	const flow = useReactFlow();
	const nodeId = useNodeId();

	return (
		<>
			<NodeToolbar>
				<motion.div
					className="w-full p-1 bg-background border rounded-lg"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 100, y: 0 }}
				>
					{nodeId === "n1" ? (
						<Tooltip>
							<TooltipContent>
								You cannot delete your own PluralBuddy system block.
							</TooltipContent>
							<TooltipTrigger>
								<Button
									variant="destructive"
									disabled
									onClick={() =>
										flow.deleteElements({ nodes: [{ id: nodeId ?? "" }] })
									}
								>
									<Trash /> Delete
								</Button>
							</TooltipTrigger>
						</Tooltip>
					) : (
						<Button
							variant="destructive"
							onClick={() => {
								flow.deleteElements({ nodes: [{ id: nodeId ?? "" }] });
								toast.success(`Deleted the block on Connections.`);
							}}
						>
							<Trash /> Delete
						</Button>
					)}
				</motion.div>
			</NodeToolbar>
			{children}
		</>
	);
}
