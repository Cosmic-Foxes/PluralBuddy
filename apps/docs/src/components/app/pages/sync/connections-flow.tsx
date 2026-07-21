import { useState, useCallback } from "react";
import {
	ReactFlow,
	applyNodeChanges,
	applyEdgeChanges,
	addEdge,
	Controls,
	MiniMap,
	Background,
	BackgroundVariant,
	EdgeChange,
	Connection,
	NodeChange,
	ColorMode,
	Position,
	Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { PluralBuddySystemNode } from "./nodes/pluralbuddy";
import { PluralKitSystemNode } from "./nodes/pluralkit";
import { SpecifcAltersFilterNode } from "./nodes/specific-alters";
import { toast } from "sonner";
import { Button } from "@/components/ui/shadcn-button";
import { Plus, Sidebar, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ConnectionsSidebar } from "./connections-sidebar";

const nodeTypes = {
	pluralbuddy: PluralBuddySystemNode,
	pluralkit: PluralKitSystemNode,
	specificalters: SpecifcAltersFilterNode,
};

export function ConnectionsFlow() {
	const initialNodes = [
		{
			id: "n1",
			position: { x: 0, y: 0 },
			data: { alters: 312, tags: 328 },
			type: "pluralbuddy",
			deletable: false,
		},
	];
	const initialEdges = [
		{
			id: "n2-nf",
			source: "n2",
			target: "nf",
			type: "smoothstep",
			animated: true,
			sourceHandle: "read",
			targetHandle: "data",
		},
		{
			id: "nf-n1",
			source: "nf",
			target: "n1",
			type: "smoothstep",
			animated: true,
			sourceHandle: "output_true",
			targetHandle: "write",
		},
	];

	const [nodes, setNodes] = useState(initialNodes);
	const [edges, setEdges] = useState(initialEdges);
	const { resolvedTheme } = useTheme();

	const onNodesChange = useCallback(
		(changes: NodeChange<any>[]) =>
			setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
		[],
	);
	const onEdgesChange = useCallback(
		(changes: EdgeChange<any>[]) =>
			setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
		[],
	);
	const onConnect = useCallback((params: Connection) => {
		if (params.source === params.target) {
			toast.error("You cannot connect a source to itself.");
			return;
		}
		setEdges((edgesSnapshot) =>
			addEdge({ ...params, animated: true, type: "smoothstep" }, edgesSnapshot),
		);
	}, []);

	return (
		<div style={{ width: "100%", height: "100%" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				nodeTypes={nodeTypes}
				onConnect={onConnect}
				colorMode={(resolvedTheme as ColorMode) ?? "light"}
				proOptions={{
					// Software is open-source. No one is expected to "pay" to use open-source software.
					// Not sure who thought putting an attribution on an open-source library was a good idea.
					hideAttribution: true,
				}}
				fitView
			>
				<Controls />
				<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
				<ConnectionsSidebar />
			</ReactFlow>
		</div>
	);
}
