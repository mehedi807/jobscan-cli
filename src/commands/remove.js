import { removeUrl, clearUrls } from "../config.js";
import chalk from "chalk";
import inquirer from "inquirer";

export default function removeCommand(program) {
  program
    .command("remove [url]")
    .option("-a, --all", "Remove all career page URLs")
    .description("Remove a career page URL or all URLs")
    .action(async (url, options) => {
      if (options.all) {
        const { confirm } = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirm",
            message: "Are you sure you want to remove ALL configured URLs?",
            default: false,
          },
        ]);

        if (confirm) {
          clearUrls();
          console.log(chalk.green("✓ All URLs removed."));
        } else {
          console.log(chalk.gray("Operation cancelled."));
        }
        return;
      }

      if (!url) {
        console.log(chalk.red("Error: Please provide a URL or use --all flag"));
        return;
      }

      const removed = removeUrl(url);

      if (removed) {
        console.log(chalk.green(`✓ Removed: ${url}`));
      } else {
        console.log(chalk.yellow(`ℹ URL not found: ${url}`));
      }
    });
}
