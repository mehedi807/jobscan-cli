import inquirer from "inquirer";
import { saveConfig, getConfig } from "../config.js";
import { initDb } from "../lib/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function initCommand(program) {
  program
    .command("init")
    .description("Initialize jobscan configuration")
    .action(async () => {
      const currentConfig = getConfig();
      let config = {};

      if (currentConfig && currentConfig.provider && currentConfig.apiKey) {
        console.log(
          chalk.cyan(
            `You have already ${currentConfig.provider} API key configured.`,
          ),
        );

        const defaultsPath = path.join(
          __dirname,
          "../../data/default-urls.json",
        );
        let defaultUrls = [];
        try {
          defaultUrls = JSON.parse(fs.readFileSync(defaultsPath, "utf-8"));
        } catch (e) {
          console.warn(chalk.yellow("Could not load default URLs"));
        }

        config = {
          ...currentConfig,
          urls: [...new Set([...(currentConfig.urls || []), ...defaultUrls])],
        };
      } else {
        console.log(chalk.blue("Welcome to JobScan CLI Setup"));

        const answers = await inquirer.prompt([
          {
            type: "rawlist",
            name: "provider",
            message: "Select AI Provider:",
            choices: ["groq", "gemini", "openai"],
          },
          {
            type: "password",
            name: "apiKey",
            message: (answers) => `Enter ${answers.provider} API Key:`,
            mask: "*",
            validate: (input) =>
              input.length > 0 ? true : "API Key is required",
          },
        ]);

        const defaultsPath = path.join(
          __dirname,
          "../../data/default-urls.json",
        );
        let defaultUrls = [];
        try {
          defaultUrls = JSON.parse(fs.readFileSync(defaultsPath, "utf-8"));
        } catch (e) {
          console.warn(chalk.yellow("Could not load default URLs"));
        }

        config = {
          provider: answers.provider,
          apiKey: answers.apiKey,
          urls: defaultUrls,
        };
      }

      saveConfig(config);
      initDb();

      console.log(
        chalk.green("✓ Configuration saved to ~/.jobscan/config.json"),
      );
      console.log(chalk.green(`✓ Loaded ${config.urls.length} career pages`));
      console.log(chalk.white('Run "jobscan" to see latest jobs!'));
    });
}
