import { RootProvider } from "@fumadocs/base-ui/provider/base";
import "../global.css";
import { Inter } from "next/font/google";
import { Body } from "@/components/body";
import { Html } from "@/components/html";
import { Toaster } from "@/components/ui/sonner";
import { Viewport } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NextIntlClientProvider } from "next-intl";
import { AdjustableBanner } from "@/components/adjustable-banner";
import { NextProvider } from "fumadocs-core/framework/next";
import OramaSearchDialog from "@/components/search-orama";
import { TreeContextProvider } from "@fumadocs/base-ui/contexts/tree";
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
}: LayoutProps<"/[lang]">) {
	const lang = (await params).lang;

	return (
		<Html>
			<Body>
				<AdjustableBanner />
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
								<NextIntlClientProvider>
									{children}

									<Toaster position="bottom-right" />
								</NextIntlClientProvider>
							</TooltipProvider>
						</RootProvider>
					</TreeContextProvider>
				</NextProvider>
			</Body>
		</Html>
	);
}
