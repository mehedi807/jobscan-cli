import { addUrl } from "../config.js";
import chalk from "chalk";

export default function addCommand(program) {
  program
    .command("add <url>")
    .description("Add a new career page URL")
    .action((inputUrl) => {
      try {
        let url = inputUrl;
        if (!/^https?:\/\//i.test(url)) {
          url = `https://${url}`;
        }

        new URL(url);

        const added = addUrl(url);
        if (added) {
          console.log(chalk.green(`✓ Added: ${url}`));
        } else {
          console.log(chalk.yellow(`ℹ URL already exists: ${url}`));
        }
      } catch (e) {
        console.error(chalk.red("Error: Invalid URL"));
      }
    });
}
