import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".jobscan");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function getConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  } catch (error) {
    return null;
  }
}

export function getConfigPath() {
  return CONFIG_FILE;
}

export function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function addUrl(url) {
  const config = getConfig() || { urls: [] };
  if (!config.urls) config.urls = [];

  if (!config.urls.includes(url)) {
    config.urls.push(url);
    saveConfig(config);
    return true;
  }
  return false;
}

export function removeUrl(url) {
  const config = getConfig();
  if (!config || !config.urls) return false;

  const originalLength = config.urls.length;

  const normalize = (u) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const target = normalize(url);

  config.urls = config.urls.filter((u) => normalize(u) !== target);

  if (config.urls.length < originalLength) {
    saveConfig(config);
    return true;
  }
  return false;
}
