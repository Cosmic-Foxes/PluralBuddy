import { SystemFlags, type PSystem } from "plurography";

export function getSystemFeatures(data: PSystem) {
	return {
		keepProxyTags: (data.flags & SystemFlags.KEEP_PROXY_TAGS) !== 0,

		has: (flag: SystemFlags) => (data.flags & flag) !== 0,
		disable: (flag: SystemFlags) =>
			(data.flags & flag) === 0 /* doesn't have flag */
				? data.flags
				: data.flags - flag,
		enable: (flag: SystemFlags) =>
			(data.flags & flag) !== 0 /* does have flag */
				? data.flags
				: data.flags + flag,
		bool: (flag: SystemFlags, bool?: boolean) =>
			bool
				? (data.flags & flag) !== 0 /* does have flag */
					? data.flags
					: data.flags + flag
				: (data.flags & flag) === 0 /* doesn't have flag */
					? data.flags
					: data.flags - flag,
	};
}
