import {
	defineConfig,
	frontmatterSchema,
	metaSchema,
} from "fumadocs-mdx/config";
import { defineDocs } from "fumadocs-mdx/macro";
import {
	remarkFeedbackBlock,
	type RemarkFeedbackBlockOptions,
} from "fumadocs-core/mdx-plugins/remark-feedback-block";
import { openapiPlugin } from "fumadocs-openapi/server";
import { loader } from "fumadocs-core/source";
import { icons } from "lucide-react";
import { createElement } from "react";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
	dir: "content/docs",
});

export default defineConfig({
	mdxOptions: {
		// MDX options
		remarkPlugins: [[remarkFeedbackBlock]],
	},
});

export const source = loader({
	// optional: adds a badge to each page item in page tree
	plugins: [openapiPlugin()],
	source: docs.toFumadocsSource(),
	baseUrl: "/docs",

	icon(icon) {
		if (!icon) {
			// You may set a default icon
			return;
		}
		if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
	},
});
