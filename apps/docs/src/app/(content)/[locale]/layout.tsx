import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
    const lang = (await params).locale;
    console.log(lang)

    if (!hasLocale(routing.locales, lang)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(lang);

    return <NextIntlClientProvider>{children}</NextIntlClientProvider>
}