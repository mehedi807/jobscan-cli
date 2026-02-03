import { getAllJobs } from "../lib/db.js";
import { printJobs } from "../utils/ui.js";
import chalk from "chalk";

export default function listCommand(program) {
  program
    .command("list")
    .description("List jobs from database")
    .option("-c, --company <name>", "Filter by company")
    .option("-n, --limit <number>", "Limit results", "50")
    .action((options) => {
      const jobs = getAllJobs(options);

      if (jobs.length === 0) {
        console.log(chalk.yellow("No jobs found in database."));
        return;
      }

      console.log(chalk.bold(`Found ${jobs.length} jobs:`));
      printJobs(jobs);
    });
}
