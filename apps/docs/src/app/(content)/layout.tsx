import { RootProvider } from "@fumadocs/base-ui/provider/base";
import "../global.css";
import { TreeContextProvider } from "@fumadocs/base-ui/contexts/tree";
import { NextProvider } from "fumadocs-core/framework/next";
import { Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { AdjustableBanner } from "@/components/adjustable-banner";
import { Body } from "@/components/body";
import { Html } from "@/components/html";
import OramaSearchDialog from "@/components/search-orama";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
