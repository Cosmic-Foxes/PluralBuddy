import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
	console.log(locale)
	return {
		locale: locale ?? "en",
		messages: (await import(`../../messages/${locale ?? "en"}.json`)).default,
	};
});
