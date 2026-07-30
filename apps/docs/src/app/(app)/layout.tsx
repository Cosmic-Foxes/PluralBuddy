import { Body } from "@/components/body";
import "../global.css";
import { Html } from "@/components/html";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "next-themes";
import { Metadata } from "next";

export default async function Layout({ children }: LayoutProps<"/[lang]">) {
	const messages = (await import(`../../../messages/en.json`)).default;

	return (
		<Html>
			<Body>
				<TooltipProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<NextIntlClientProvider locale="en" messages={messages}>
							<NuqsAdapter>{children}</NuqsAdapter>

							<Toaster position="bottom-right" />
						</NextIntlClientProvider>
					</ThemeProvider>
				</TooltipProvider>
			</Body>
		</Html>
	);
}
