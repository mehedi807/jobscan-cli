import { removeUrl } from "../config.js";
import chalk from "chalk";

export default function removeCommand(program) {
  program
    .command("remove <url>")
    .description("Remove a career page URL")
    .action((url) => {
      const removed = removeUrl(url);

      if (removed) {
        console.log(chalk.green(`✓ Removed: ${url}`));
      } else {
        console.log(chalk.yellow(`ℹ URL not found: ${url}`));
      }
    });
}
