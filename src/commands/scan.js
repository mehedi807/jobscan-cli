import { getConfig } from "../config.js";
import { scrape, closeBrowser } from "../lib/scraper.js";
import { getProvider } from "../providers/index.js";
import { saveJobs } from "../lib/db.js";
import { printJobs } from "../utils/ui.js";
import chalk from "chalk";
import ora from "ora";

export default function scanCommand(program) {
  program
    .command("scan", { isDefault: true })
    .description("Scan configured URLs for job postings")
    .option(
      "--all",
      "Show all jobs found in this scan (includes already saved)",
    )
    .action(async (options) => {
      const config = getConfig();
      if (!config?.apiKey) {
        console.error(
          chalk.red("Error: Config or API key not found. Run 'jobscan init'."),
        );
        process.exit(1);
      }

      const { urls, provider, apiKey } = config;
      if (!urls?.length) {
        console.log(
          chalk.yellow('No URLs configured. Run "jobscan add <url>"'),
        );
        process.exit(0);
      }

      console.log(
        chalk.blue(
          `Scanning ${urls.length} career pages with ${provider}...\n`,
        ),
      );

      const providerModule = getProvider(provider);
      const stats = { new: 0, total: 0 };
      const displayJobs = [];
      let isInterrupted = false;

      const onInterrupt = () => {
        if (isInterrupted) {
          process.exit(1);
        }
        isInterrupted = true;
        console.log(chalk.yellow("\n\nStopping..."));
      };

      process.on("SIGINT", onInterrupt);

      try {
        for (const url of urls) {
          if (isInterrupted) break;

          console.log(chalk.gray(`Scanning ${url}...`));
          const spinner = ora("").start();

          try {
            const text = await scrape(url);
            if (isInterrupted) {
              spinner.stop();
              break;
            }

            const jobs = await providerModule.parseJobs(apiKey, text, url);

            if (jobs.length === 0) {
              spinner.warn("0 jobs found");
              continue;
            }

            jobs.forEach((j) => (j.source_url = url));
            const newJobs = saveJobs(jobs);

            stats.new += newJobs.length;
            stats.total += jobs.length;

            const countMsg = `${jobs.length} jobs (${newJobs.length} new)`;
            if (newJobs.length > 0) {
              spinner.succeed(chalk.green(countMsg));
            } else {
              spinner.succeed(chalk.gray(countMsg));
            }

            if (options.all) {
              displayJobs.push(...jobs);
            } else {
              displayJobs.push(...newJobs);
            }
          } catch (error) {
            if (!isInterrupted) {
              spinner.fail(error.message);
            } else {
              spinner.stop();
            }
          }
        }
      } finally {
        process.removeListener("SIGINT", onInterrupt);
        await closeBrowser();
      }

      if (displayJobs.length === 0) {
        if (!options.all) {
          console.log(chalk.yellow(`\nRun 'jobscan list' to view saved jobs.`));
        }
      } else {
        console.log(chalk.bold(`\n${displayJobs.length} jobs:`));
        printJobs(displayJobs);
      }
      console.log(
        chalk.green(
          `\n${stats.new} new job${stats.new === 1 ? "" : "s"} found.`,
        ),
      );
    });
}
