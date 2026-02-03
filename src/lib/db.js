import Database from "better-sqlite3";
import path from "path";
import os from "os";
import crypto from "crypto";
import fs from "fs";

const DB_DIR = path.join(os.homedir(), ".jobscan");
const DB_FILE = path.join(DB_DIR, "jobs.db");

let db;

function getDb() {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new Database(DB_FILE);
    db.prepare(
      `
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT,
        job_url TEXT,
        source_url TEXT NOT NULL,
        first_seen DATE NOT NULL,
        deadline DATE,
        raw_data JSON
      )
    `,
    ).run();
  }
  return db;
}

export function initDb() {
  getDb();
}

export function getDbPath() {
  return DB_FILE;
}

function cleanStr(text) {
  return text ? text.toLowerCase().trim().replace(/\s+/g, " ") : "";
}

function cleanUrl(url) {
  if (!url) return "";
  try {
    return url.trim().replace(/\/$/, "");
  } catch (e) {
    return url.trim();
  }
}

function createId(job) {
  let data;
  const jobUrl = cleanUrl(job.url);
  const sourceUrl = cleanUrl(job.source_url);

  const cleanJobUrl = jobUrl ? jobUrl.split("#")[0] : "";
  const cleanSourceUrl = sourceUrl ? sourceUrl.split("#")[0] : "";

  if (jobUrl && cleanJobUrl !== cleanSourceUrl) {
    data = jobUrl;
  } else {
    data = `${sourceUrl}|${cleanStr(job.title)}`;
  }
  return crypto.createHash("md5").update(data).digest("hex");
}

export function saveJobs(jobs) {
  const database = getDb();
  const insertStmt = database.prepare(`
    INSERT OR IGNORE INTO jobs (id, title, company, job_url, source_url, first_seen, deadline, raw_data)
    VALUES (@id, @title, @company, @job_url, @source_url, @first_seen, @deadline, @raw_data)
  `);

  const newJobs = [];

  const transaction = database.transaction((jobsToInsert) => {
    for (const job of jobsToInsert) {
      const id = createId(job);
      const params = {
        id,
        title: job.title,
        company: job.company || "",
        job_url: job.url || "",
        source_url: job.source_url,
        first_seen: new Date().toISOString(),
        deadline: job.deadline || null,
        raw_data: JSON.stringify(job),
      };

      const result = insertStmt.run(params);
      if (result.changes > 0) {
        newJobs.push({ ...job, id });
      }
    }
  });

  transaction(jobs);
  return newJobs;
}

export function getAllJobs(options = {}) {
  const database = getDb();
  let query = "SELECT * FROM jobs ORDER BY first_seen DESC";
  const params = [];

  if (options.company) {
    query = "SELECT * FROM jobs WHERE company LIKE ? ORDER BY first_seen DESC";
    params.push(`%${options.company}%`);
  }

  if (options.limit) {
    query += ` LIMIT ${options.limit}`;
  }

  return database.prepare(query).all(...params);
}
