# jobscan-cli

**JobScan** turns any career page into a structured, trackable feed. It uses LLMs to parse job listings and a local SQLite database to track history.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/node/v/jobscan-cli.svg)](package.json)

## Features

- **🤖 AI Extraction**: Parses jobs from any HTML layout using LLM.
- **🔄 Smart Diffing**: Highlights new jobs since the last scan.
- **⚡ Fast & Headless**: Uses optimized Playwright scraping.
- **🔒 Privacy First**: Database and API keys live on your machine.
- **🇧🇩 Pre-loaded**: Comes with top 20 BD tech companies ready to scan.

## Installation

```bash
npm install -g jobscan-cli
```

## Usage

### Setup

Configure LLM Api key

```bash
$ jobscan init
```

### Add Career Pages

Add the URL of any company's career page.

```bash
$ jobscan add https://career.grameenphone.com/job

```

### Scan

Scan all configured career pages to identify new job postings.

```bash
$ jobscan
```

### Manage URLs

List or remove tracked pages.

```bash
$ jobscan urls
$ jobscan remove https://careers.google.com/jobs
```

### History

View all previously found jobs.

```bash
$ jobscan list
$ jobscan list --company Robi
```

## CLI Reference

| Command  | Alias       | Description               |
| -------- | ----------- | ------------------------- |
| `init`   |             | Configure API keys        |
| `add`    |             | Add a new career page URL |
| `scan`   | `(default)` | Scan pages for new jobs   |
| `list`   |             | List all jobs in database |
| `urls`   |             | List existing URLs        |
| `remove` |             | Remove an existing URL    |
| `clear`  |             | Reset database or config  |

## Configuration

Configuration is stored in `~/.jobscan/config.json`.

## Built With

- [Playwright](https://playwright.dev/) - Browser automation & scraping.
- [Gemini](https://ai.google.dev/) / [Groq](https://groq.com/) / [OpenAI](https://openai.com/) - LLM.
- [SQLite](https://sqlite.org/) - Local database.

## License

MIT
