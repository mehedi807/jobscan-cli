import { getConfig } from "../config.js";
import chalk from "chalk";

export default function urlsCommand(program) {
  program
    .command("urls")
    .description("List all configured career page URLs")
    .action(() => {
      const config = getConfig();
      const urls = config ? config.urls || [] : [];

      if (urls.length === 0) {
        console.log(chalk.yellow("No URLs configured."));
      } else {
        console.log(chalk.bold(`Configured URLs (${urls.length}):`));
        urls.forEach((url, idx) => {
          console.log(` ${idx + 1}. ${url}`);
        });
      }
    });
}
