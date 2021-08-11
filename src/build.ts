import chalk from "chalk";
import { build } from "esbuild";

import buildConfig from "../build.config";
import { createLogger } from "./logger";

const logger = createLogger("build");
logger.setLevel("info");

async function runBuild(): Promise<void> {
	logger.info(chalk.greenBright("Building yare code..."));
	await build({
		...buildConfig,
		entryPoints: ["./var/code/main.ts"],
		outdir: "./var/output",
		write: true,
	});
	logger.info(chalk.greenBright("Build complete."));
}

runBuild().then();
