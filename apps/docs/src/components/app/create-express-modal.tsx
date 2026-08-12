import { useMediaQuery } from "fumadocs-core/utils/use-media-query";
import { AnimatePresence, motion } from "motion/react";
import { useQueryState } from "nuqs";
import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { m } from "@/paraglide/messages";
import { useTRPCClient } from "@/server/client";
import { Stepper, StepperItem } from "../stepper";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerTrigger,
} from "../ui/drawer";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Button } from "../ui/shadcn-button";
import { Spinner } from "../ui/spinner";
import { AlterInput } from "./alter-input";
import { AlterView } from "./alter-view";

export function CreateExpressModal({ children }: { children: ReactNode }) {
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const [selectedAlter, setSelected] = useQueryState("alter");
	const [page, setPage] = useState(0);
	const [open, setOpen] = useState(false);

	const manualCloseSetOpen = (newState: boolean) => {
		if (newState === false) {
			setSelected(null);
			setPage(0);
		}
		setOpen(newState);
	};

	useEffect(() => {
		if (selectedAlter !== null) {
			setOpen(true);
			setPage(1);
		}
	}, []);

	if (isDesktop)
		return (
			<Dialog open={open} onOpenChange={manualCloseSetOpen}>
				<DialogTrigger>{children}</DialogTrigger>
				<DialogContent className="block min-w-[700px]">
					<DialogContents
						open={open}
						setOpen={manualCloseSetOpen}
						FooterComponent={DialogFooter}
						selectedAlter={selectedAlter}
						setSelectedAlter={setSelected}
						page={page}
						setPage={setPage}
					/>
				</DialogContent>
			</Dialog>
		);

	return (
		<Drawer open={open} onOpenChange={manualCloseSetOpen}>
			<DrawerTrigger>{children}</DrawerTrigger>
			<DrawerContent className="px-2">
				<DialogContents
					open={open}
					setOpen={manualCloseSetOpen}
					FooterComponent={DrawerFooter}
					selectedAlter={selectedAlter}
					setSelectedAlter={setSelected}
					page={page}
					setPage={setPage}
				/>
			</DrawerContent>
		</Drawer>
	);
}

function DialogContents({
	open,
	setOpen,
	selectedAlter,
	setSelectedAlter: setSelected,
	FooterComponent,
	page,
	setPage,
}: {
	open: boolean;
	setOpen: (value: boolean) => void;
	selectedAlter: string | null;
	setSelectedAlter: (value: string | null) => void;
	page: number | null;
	setPage: (value: number) => void;
	FooterComponent: ({ children }: { children: ReactNode }) => ReactNode;
}) {
	const [token, setToken] = useState<string>("");
	const [nextLoading, setNextLoading] = useState<boolean>(false);
	const navigate = useNavigate();
	const trpc = useTRPCClient();

	useEffect(() => {
		if (page === 0) {
			setToken("");
		}
	}, [page]);

	return (
		<AnimatePresence initial={false}>
			<AnimatePresence mode="wait" initial={false}>
				{page === 0 && (
					<motion.div
						key="page0"
						initial={{ opacity: 0, x: -40, scale: 0.97 }}
						animate={{ opacity: 1, x: 0, scale: 1 }}
						exit={{ opacity: 0, x: 40, scale: 0.97 }}
						transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
					>
						<DialogTitle className="pb-3">{m["ExpressModal.page0_title"]()}</DialogTitle>
						<DialogDescription>{m["ExpressModal.page0_desc"]()}</DialogDescription>
						<Separator />
						<AlterInput
							selectedAlter={selectedAlter}
							setSelectedAlter={setSelected}
							disableExpressAlters
						/>
						<FooterComponent>
							<Button
								disabled={selectedAlter === null}
								onClick={() => setPage(1)}
								taptic
							>
								{m["ExpressModal.pagination_next"]()}
							</Button>
						</FooterComponent>
					</motion.div>
				)}
				{page === 1 && (
					<motion.div
						key="page1"
						initial={{ opacity: 0, x: 40, scale: 0.97 }}
						animate={{ opacity: 1, x: 0, scale: 1 }}
						exit={{ opacity: 0, x: -40, scale: 0.97 }}
						transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
						className="max-md:overflow-y-auto"
					>
						<DialogTitle className="pb-3">{m["ExpressModal.page1_title"]()}</DialogTitle>
						<DialogDescription>{m["ExpressModal.page1_desc"]()}</DialogDescription>
						<Separator />
						<div className="p-4">
							{selectedAlter && <AlterView selectedAlter={selectedAlter} />}
						</div>
						<Stepper className="p-4">
							<StepperItem
								title={m["ExpressModal.stepper1_title"]()}
								description={m["ExpressModal.stepper1_desc"]()}
							>
								<Link
									to="https://discord.com/developers/applications"
									target="_blank"
								>
									<Button>{m["ExpressModal.stepper1_btn"]()}</Button>
								</Link>
							</StepperItem>
							<StepperItem
								title={m["ExpressModal.stepper1_title"]()}
								description={m["ExpressModal.stepper1_desc"]()}
							>
								<Input
									placeholder="Bot Token"
									value={token}
									onChange={(e) => setToken(e.target.value)}
								/>
							</StepperItem>
						</Stepper>
						<FooterComponent>
							<Button
								variant="outline"
								onClick={() => setPage(0)}
								disabled={nextLoading}
								taptic
							>
								{m["ExpressModal.pagination_back"]()}
							</Button>
							<Button
								disabled={nextLoading || !token}
								taptic
								onClick={async () => {
									setNextLoading(true);

									let err = false;

									await trpc.express.createExpressApplication
										.query({
											token,
											alterId: selectedAlter ?? "",
										})
										.catch((e) => {
											toast.error(
												m["ExpressModal.error_creating"] ({
													message: e.message,
												}),
											);
											setNextLoading(false);
											err = true;
										});

									if (!err) {
										toast.success(m["ExpressModal.success"]());

										setNextLoading(false);
										navigate(`/app/settings/express/alter/${selectedAlter}`);
									}
								}}
							>
								{nextLoading && <Spinner />} {m["ExpressModal.pagination_next"]()}
							</Button>
						</FooterComponent>
					</motion.div>
				)}
			</AnimatePresence>
		</AnimatePresence>
	);
}
