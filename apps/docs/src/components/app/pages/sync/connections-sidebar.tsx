import { Button } from "@/components/ui/shadcn-button";
import { Panel, useReactFlow } from "@xyflow/react";
import { Plus, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

const possibleNodes = [
	{
		type: "pluralkit",
		name: "PluralKit",
		headline: "System",
		description: "Sync a PluralKit system with PluralKit tokens.",
	},
	{
		type: "florality",
		name: "Florality",
		headline: "System",
		description: "Sync a Florality system with the Florality public API.",
	},
	{
		type: "specificalters",
		name: "If alter",
		headline: "Filter",
		description: "Filter out specific alters from the flow.",
	},
	{
		type: "alterstags",
		name: "If alter has group/tag",
		headline: "Filter",
		description:
			"Filter out specific alters with a corresponding group/tag from the flow.",
	},
	{
		type: "stripalterdata",
		name: "Strip alter data from system",
		headline: "Data Manipulation",
		description: "Remove certain data fields from alter data that is input.",
	},
	{
		type: "striptagdata",
		name: "Strip tag data from system",
		headline: "Data Manipulation",
		description: "Remove certain data fields from tag data that is input."
	},
	{
		type: "stop",
		name: "Stop syncing",
		headline: "Control",
		description: "Completely stops sync execution when this block is ran."
	},
	{
		type: "log",
		name: "Log text",
		headline: "Control",
		description: "Log text to the syncing log."
	}
];

export function ConnectionsSidebar({
	sidebar,
	setSidebar,
}: {
	sidebar: boolean;
	setSidebar: (val: boolean) => void;
}) {
	const flow = useReactFlow();

	return (
		<>
			<Panel position="top-left">
				{!sidebar && (
					<Button size="icon-lg" onClick={() => setSidebar(true)}>
						<Plus />
					</Button>
				)}
			</Panel>
			<AnimatePresence>
				{sidebar && (
					<motion.div
						className="m-2 p-4 h-[calc(100%-20px)] scroll-fade overflow-auto z-10 relative rounded-lg w-[300px] backdrop-blur-lg bg-white/10"
						initial={{ x: -60, opacity: 0 }}
						animate={{ x: 0, opacity: 100 }}
						exit={{ x: -60, opacity: 0 }}
						transition={{ type: "tween" }}
					>
						<Button
							size="icon-lg"
							onClick={() => setSidebar(false)}
							variant="ghost"
						>
							<X />
						</Button>
						<div className="grid gap-2 mt-3 max-h-full ">
							<h1 className="text-3xl font-bold">Blocks</h1>
							<p className="text-sm">
								Use these blocks to create your sync workload that works best
								for you.
							</p>
							{...possibleNodes.map((node) => (
								<Button
									key={node.type}
									className="block text-left h-auto p-2 whitespace-normal"
									variant="outline"
									onClick={async () => {
										const {x, y} = flow.getViewport()
										flow.addNodes({
											id: `${crypto.randomUUID()}-${node.type}`,
											position: {
												x,y
											},
											data: {},
											type: node.type,
										});
										await flow.setCenter(x,y, { zoom: 1, duration: 600})
										toast.success(`Created "${node.name}" on Connections.`)
									}}
								>
									<div className="max-w-full">
										<code className="uppercase text-sm">{node.headline}</code>
										<strong className="block text-lg">{node.name}</strong>
										<p className="text-sm">{node.description}</p>
									</div>
								</Button>
							))}
						</div>
						<div className="my-128"></div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
