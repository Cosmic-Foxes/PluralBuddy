"use client";

import { ImportDataForm } from "@/components/app/import-data-form";
import { AuthorizedAppsCard } from "@/components/authorized-apps";
import { DiscordLoginComponent } from "@/components/discord-login";
import { SettingsSidebar } from "@/components/settings-sidebar";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { AppWindow } from "lucide-react";
import { DynamicPageTitle } from "../../dynamic-title";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ConnectionsFlow } from "./connections-flow";
import { useTRPCClient } from "@/server/client";

export default function SyncPage() {
	const trpc = useTRPCClient();
	const { data: v, isPending } = useQuery({
		queryKey: [`connections/system-data`],
		queryFn: async () => trpc.connections.getSystemMetadata.query(),
	});

	if (isPending)
		return (
			<div className="grid grid-cols-1 my-[30px] border p-3 rounded-2xl relative">
				<div className="fixed block top-[50%] right-[50%] ">
					<Spinner />
				</div>
			</div>
		);

	return (
		<main className="flex w-full flex-1 flex-col gap-6 md:md:px-4 max-md:px-2 pt-18 items-center mx-auto max-w-[1000px] mb-3">
			<DynamicPageTitle title="Connections • PluralBuddy App" />
			<Card className="w-full">
				<CardContent>
					<Breadcrumb className="text-left">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink>Settings</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink href="/app/settings/authorized-apps">
									Connections
								</BreadcrumbLink>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</CardContent>
			</Card>
			<div className="max-md:space-y-3 items-center gap-6 w-full">
				<Card className="w-full mb-4">
					<CardContent>
						<CardTitle>Connections</CardTitle>
						<CardDescription>
							Sync data across plurality services with connections, allowing
							fine-grained customizable syncing.
						</CardDescription>
					</CardContent>
				</Card>
				<Separator className="mb-4" />
				<div className="w-full h-[600px] border rounded-xl">
					<ConnectionsFlow systemMetadata={v ?? { systemExists: false, tags: 0, alters: 0 }} />
				</div>
			</div>
		</main>
	);
}
