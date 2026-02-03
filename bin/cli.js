#!/usr/bin/env node

import { program } from "commander";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initCommand from "../src/commands/init.js";
import addCommand from "../src/commands/add.js";
import scanCommand from "../src/commands/scan.js";
import listCommand from "../src/commands/list.js";
import clearCommand from "../src/commands/clear.js";
import removeCommand from "../src/commands/remove.js";
import urlsCommand from "../src/commands/urls.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8"),
);

program.name("jobscan").description(pkg.description).version(pkg.version);

initCommand(program);
addCommand(program);
removeCommand(program);
urlsCommand(program);
scanCommand(program);
listCommand(program);
clearCommand(program);

program.parse();
