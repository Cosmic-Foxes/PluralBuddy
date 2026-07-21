import { Button } from "@/components/ui/shadcn-button";
import { Panel, useReactFlow } from "@xyflow/react";
import { Plus, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { motion } from "motion/react";

const possibleNodes = [
	{
		type: "pluralkit",
		name: "PluralKit",
		headline: "System",
		description: "Sync a PluralKit system with PluralKit tokens.",
	},
	{
		type: "specificalters",
		name: "If alter",
		headline: "Filter",
		description: "Filter out specific alters from the flow.",
	},
];

export function ConnectionsSidebar() {
	const flow = useReactFlow();
	const [sidebar, setSidebar] = useState(false);

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
						className="m-2 p-4 h-[calc(100%-20px)] z-10 relative rounded-lg w-[300px] backdrop-blur-lg bg-white/10"
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
						<div className="grid gap-2 mt-3">
							{...possibleNodes.map((node) => (
								<Button
									key={node.type}
									className="block text-left h-auto p-2 whitespace-normal"
									variant="outline"
									onClick={() => {
										flow.addNodes({
											id: `${crypto.randomUUID()}-${node.type}`,
											position: { x: flow.getViewport().x, y: flow.getViewport().y },
											data: { },
											type: node.type,
										});
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
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
