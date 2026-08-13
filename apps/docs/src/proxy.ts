import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { paraglideMiddleware } from "./paraglide/server";

export default function proxy(request: NextRequest, event: NextFetchEvent) {
	if (
		request.url.includes("/oauth2/authorize") &&
		!request.url.includes("/docs")
	)
		return NextResponse.redirect(
			new URL(
				`/api/auth/oauth2/authorize?${request.nextUrl.searchParams.toString()}`,
				request.url,
			),
		);
	if (request.url.endsWith("/developers/applications"))
		return NextResponse.redirect(
			new URL(`/app/settings/developers-v2`, request.url),
		);
	if (request.url.includes("/docs")) {
		if (request.url.includes("/en/docs"))
			return NextResponse.redirect(
				new URL(`/docs/${request.url.split("/docs")[1]}`, request.url),
			);
		// return;
	}

	return paraglideMiddleware(request, ({ request, locale }) => {
		request.headers.set("x-paraglide-locale", locale);
		request.headers.set("x-paraglide-request-url", request.url);
		return NextResponse.rewrite(request.url, request);
	});
}