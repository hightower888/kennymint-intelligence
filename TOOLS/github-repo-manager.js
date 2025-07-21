#!/usr/bin/env node

const { Octokit } = require("@octokit/rest");
const inquirer = require("inquirer");
const chalk = require("chalk");

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "hightower888";
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

if (!GITHUB_ACCESS_TOKEN) {
  console.error("❌ GITHUB_ACCESS_TOKEN environment variable is required.");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_ACCESS_TOKEN });

async function listRepos() {
  const { data } = await octokit.repos.listForUser({
    username: GITHUB_USERNAME,
    per_page: 10 });
  return data;
}

async function changeVisibility(visibility) {
  const repos = await listRepos();
  const toChange = repos.filter(
    (repo) => (visibility === "private" ? !repo.private : repo.private)
  );

  if (toChange.length === 0) {
    console.log(chalk.yellow("No repositories need to be changed."));
    return;
  }

  console.log(
    chalk.blue(
      `Found ${toChange.length} repositories to change to ${visibility}:`
    )
  );
  toChange.forEach((repo) =>
    console.log(
      chalk.gray(`  ${repo.name} (currently ${repo.private ? "private" : "public"})`)
    )
  );

  const { confirm } = await inquirer.prompt(
    {
      type: "confirm",
      name: "confirm",
      message: `Are you sure you want to change ${toChange.length} repositories to ${visibility}?`,
      default: false,
    },
  );

  if (!confirm) {
    console.log(chalk.yellow("Operation cancelled."));
    return;
  }

  for (const repo of toChange) {
    try {
      await octokit.repos.update({
        owner: GITHUB_USERNAME,
        repo: repo.name,
        private: visibility === "private",
      });
      console.log(chalk.green(`✅ ${repo.name} set to ${visibility}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error updating ${repo.name}:`), error);
    }
  }
}

async function main() {
  const { visibility } = await inquirer.prompt(
    {
      type: "list",
      name: "visibility",
      message: "Change all your repositories to:",
      choices: [
        { name: "🔒 Private", value: "private" },
        { name: "🌐 Public", value: "public" },
      ],
    },
  );
  await changeVisibility(visibility);
}

main(); 