import { useState, useCallback } from "react";
import {
	ReactFlow,
	applyNodeChanges,
	applyEdgeChanges,
	addEdge,
	Controls,
	Background,
	BackgroundVariant,
	EdgeChange,
	Connection,
	NodeChange,
	ColorMode,
	Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { PluralBuddySystemNode } from "./nodes/pluralbuddy";
import { PluralKitSystemNode } from "./nodes/pluralkit";
import { SpecifcAltersFilterNode } from "./nodes/specific-alters";
import { toast } from "sonner";
import { ConnectionsSidebar } from "./connections-sidebar";
import { SpecifcAltersTagFilterNode } from "./nodes/alters-tag";
import { FloralitySystemNode } from "./nodes/florality";
import { StripAlterDataNode } from "./nodes/strip-data-alters";
import { StopSyncNode } from "./nodes/stop-sync";
import { LogTextNode } from "./nodes/log";
import { StripTagDataNode } from "./nodes/strip-data-tags";

const nodeTypes = {
	pluralbuddy: PluralBuddySystemNode,
	pluralkit: PluralKitSystemNode,
	florality: FloralitySystemNode,
	specificalters: SpecifcAltersFilterNode,
	alterstags: SpecifcAltersTagFilterNode,
	stripalterdata: StripAlterDataNode,
	striptagdata: StripTagDataNode,
	stop: StopSyncNode,
	log: LogTextNode,
};

export function ConnectionsFlow({
	systemMetadata,
}: {
	systemMetadata: {
		systemExists: boolean;
		alters: number;
		tags: number;
	};
}) {
	const initialNodes = systemMetadata.systemExists ? [
		{
			id: "n1",
			position: { x: 0, y: 0 },
			data: { alters: systemMetadata.alters, tags: systemMetadata.tags },
			type: "pluralbuddy",
			deletable: false,
		},
	] : [];

	const [nodes, setNodes] = useState(initialNodes);
	const [edges, setEdges] = useState<Edge[]>([]);
	const [sidebar, setSidebar] = useState(false);
	const { resolvedTheme } = useTheme();

	const onNodesChange = useCallback(
		(changes: NodeChange<any>[]) =>
			setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
		[],
	);
	const onEdgesChange = useCallback(
		(changes: EdgeChange<any>[]) =>
			setEdges((edgesSnapshot: Edge[]) =>
				applyEdgeChanges(changes, edgesSnapshot),
			),
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
				{!sidebar && <Controls />}
				<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
				<ConnectionsSidebar sidebar={sidebar} setSidebar={setSidebar} />
			</ReactFlow>
		</div>
	);
}
