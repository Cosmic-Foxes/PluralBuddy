import { RootProvider } from "@fumadocs/base-ui/provider/base";
import "../global.css";
import { TreeContextProvider } from "@fumadocs/base-ui/contexts/tree";
import { NextProvider } from "fumadocs-core/framework/next";
import { Viewport } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { AdjustableBanner } from "@/components/adjustable-banner";
import { Body } from "@/components/body";
import { Html } from "@/components/html";
import OramaSearchDialog from "@/components/search-orama";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routing } from "@/i18n/routing";
import { source } from "@/lib/source";


const inter = Inter({
	subsets: ["latin"],
});

export const viewport: Viewport = {
	themeColor: "#fccee8",
};

export default async function Layout({
	children,
	params,
}: LayoutProps<"/[locale]">) {

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
								SearchDialog: OramaSearchDialog
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
