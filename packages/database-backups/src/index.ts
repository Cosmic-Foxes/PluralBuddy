import cron from "node-cron";
import { exec } from "node:child_process";
import { lstat, mkdir, rm } from "node:fs/promises";
import util from "node:util";
import { tar } from "zip-a-folder";
import findRemoveSync from "find-remove";

const crontest = true;

await backupDatabase();
await removeOldDumps();

cron.schedule(crontest ? "*/30 * * * *" : "0 0 * * */3", () => {
	backupDatabase();
});

cron.schedule(crontest ? "*/60 * * * *" : "0 0 * * 0", () => {
    removeOldDumps();
});

async function backupDatabase() {
	const execute = util.promisify(exec);
	console.log(await execute(
		`mongodump --db=pluralbuddy${crontest ? "-canary" : ""} --excludeCollection=analytics --excludeCollection=messages ${process.env.MONGO}`,
	));
	console.log("dumped");

	if (
		!(
			await lstat("dumps").catch(() => ({ isDirectory: () => null }))
		).isDirectory()
	)
		await mkdir("dumps");

	console.log("tarring");
	await tar(
		"dump",
		`dumps/${new Date().toLocaleString().replaceAll(" ", "-").replaceAll("/", "-").replaceAll(",", "-").replace("--", "_").toLocaleLowerCase()}-pb-dump.tar.gz`,
	);
	await rm("dump", { recursive: true, force: true });
}

async function removeOldDumps() {
	console.log("deleted old dumps:", findRemoveSync("./dumps", {
		age: { seconds: crontest ? 1 : 604800 },
        extensions: [".gz"]
	}));
}