import inquirer from "inquirer";
import fs from "fs";
import { getConfigPath } from "../config.js";
import { getDbPath } from "../lib/db.js";
import chalk from "chalk";

export default function clearCommand(program) {
  program
    .command("clear")
    .description("Clear configuration and database")
    .action(async () => {
      const answers = await inquirer.prompt([
        {
          type: "confirm",
          name: "clearConfig",
          message: "Do you want to clear configuration (API Key & URLs)?",
          default: false,
        },
        {
          type: "confirm",
          name: "clearDb",
          message: "Do you want to clear the job database?",
          default: false,
        },
      ]);

      if (answers.clearConfig) {
        const configPath = getConfigPath();
        if (fs.existsSync(configPath)) {
          fs.unlinkSync(configPath);
          console.log(chalk.green("✓ Configuration deleted."));
        } else {
          console.log(chalk.yellow("ℹ No configuration found."));
        }
      }

      if (answers.clearDb) {
        const dbPath = getDbPath();
        if (fs.existsSync(dbPath)) {
          fs.unlinkSync(dbPath);
          console.log(chalk.green("✓ Database deleted."));
        } else {
          console.log(chalk.yellow("ℹ No database found."));
        }
      }

      if (!answers.clearConfig && !answers.clearDb) {
        console.log(chalk.gray("Operation cancelled. No changes made."));
      }
    });
}
