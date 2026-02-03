import chalk from "chalk";

export function printJobs(jobs) {
  if (!jobs || jobs.length === 0) return;

  const grouped = {};
  jobs.forEach((job) => {
    let company = job.company;
    if (!company) {
      try {
        company = new URL(job.source_url).hostname.replace("www.", "");
      } catch (e) {
        company = "Unknown";
      }
    }

    if (!grouped[company]) grouped[company] = [];
    grouped[company].push(job);
  });

  Object.keys(grouped).forEach((company) => {
    console.log(chalk.cyan.bold(`\n${company}`));
    grouped[company].forEach((job) => {
      let url = job.job_url || job.url;

      if (url && (url.startsWith("/") || !url.startsWith("http"))) {
        try {
          url = new URL(url, job.source_url).href;
        } catch (e) {
        }
      }

      console.log(`  • ${chalk.white(job.title)}`);
      if (url) console.log(chalk.gray(`    ${url}`));

      let meta = [];
      if (job.deadline) meta.push(`Deadline: ${job.deadline}`);
      if (job.first_seen) {
        meta.push(`Tracked: ${new Date(job.first_seen).toLocaleDateString()}`);
      }

      if (meta.length > 0) {
        console.log(chalk.dim(`    ${meta.join("  |  ")}`));
      }
    });
  });
}
