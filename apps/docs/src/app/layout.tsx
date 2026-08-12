import { RootProvider } from "@fumadocs/base-ui/provider/base";
import "./global.css";
import { TreeContextProvider } from "@fumadocs/base-ui/contexts/tree";
import { NextProvider } from "fumadocs-core/framework/next";
import { Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { cache } from "react";
import { Body } from "@/components/body";
import { Html } from "@/components/html";
import OramaSearchDialog from "@/components/search-orama";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { source } from "@/lib/source";
import {
	assertIsLocale,
	baseLocale,
	Locale,
	overwriteGetLocale,
	overwriteGetUrlOrigin,
} from "@/paraglide/runtime";

const ssrLocale = cache(() => ({
	locale: baseLocale,
	origin: "http://localhost",
}));
overwriteGetLocale(() => assertIsLocale(ssrLocale().locale));
overwriteGetUrlOrigin(() => ssrLocale().origin);

const inter = Inter({
	subsets: ["latin"],
});

export const viewport: Viewport = {
	themeColor: "#fccee8",
};

export default async function Layout({ children }: LayoutProps<"/">) {
	ssrLocale().locale = (await headers()).get("x-paraglide-locale") as Locale;
	ssrLocale().origin = new URL(
		(await headers()).get("x-paraglide-request-url") as string,
	).origin;

	return (
		<Html>
			<Body>
				<NextProvider>
					<TreeContextProvider tree={source.getPageTree()}>
						<RootProvider
							theme={{
								enabled: true,
							}}
							search={{
								SearchDialog: OramaSearchDialog,
							}}
						>
							<TooltipProvider>
								{children}

								<Toaster position="bottom-right" />
							</TooltipProvider>
						</RootProvider>
					</TreeContextProvider>
				</NextProvider>
			</Body>
		</Html>
	);
}
