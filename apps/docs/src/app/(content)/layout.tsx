import { RootProvider } from "fumadocs-ui/provider/next";
import "../global.css";
import { Inter } from "next/font/google";
import { Body } from "@/components/body";
import { Html } from "@/components/html";
import { Toaster } from "@/components/ui/sonner";
import { Viewport } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import OramaSearchDialog from "@/components/search-orama";
import { i18nUI } from "@/lib/layout.shared";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Banner } from "@/components/banner";
import Link from "next/link";
import { AdjustableBanner } from "@/components/adjustable-banner"; 
import { i18nProvider } from 'fumadocs-ui/i18n';


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
				<RootProvider
					theme={{
						enabled: true,
					}}
					search={{
						SearchDialog: OramaSearchDialog,
					}}
				>
					<TooltipProvider>
						<NextIntlClientProvider>
							{children}

							<Toaster position="bottom-right" />
						</NextIntlClientProvider>
					</TooltipProvider>
				</RootProvider>
			</Body>
		</Html>
	);
}
