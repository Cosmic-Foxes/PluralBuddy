import { SystemFlags, type PSystem } from "plurography";

export function getSystemFeatures(data: PSystem) {
	return {
		keepProxyTags: ((data.flags ?? 0) & SystemFlags.KEEP_PROXY_TAGS) !== 0,

		has: (flag: SystemFlags) => ((data.flags ?? 0) & flag) !== 0,
		disable: (flag: SystemFlags) =>
			(((data.flags) ?? 0) & flag) === 0 /* doesn't have flag */
				? (data.flags ?? 0)
				: (data.flags ?? 0) - flag,
		enable: (flag: SystemFlags) =>
			(((data.flags) ?? 0) & flag) !== 0 /* does have flag */
				? (data.flags ?? 0)
				: (data.flags ?? 0) + flag,
		bool: (flag: SystemFlags, bool?: boolean) =>
			bool
				? ((data.flags ?? 0) & flag) !== 0 /* does have flag */
					? (data.flags ?? 0)
					: (data.flags ?? 0) + flag
				: ((data.flags ?? 0) & flag) === 0 /* doesn't have flag */
					? (data.flags ?? 0)
					: (data.flags ?? 0) - flag,
	};
}
