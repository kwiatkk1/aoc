import chalk from "chalk";
import { readdirSync, existsSync, mkdirSync, copyFileSync } from "fs";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    year: { type: "string" },
    day: { type: "string" },
  },
});

const year = args.year || getLastYear();
const day = (args.day || getNextDay()).padStart(2, "0");
const solutionPath = `solutions/${year}/day-${day}`;

if (existsSync(solutionPath)) {
  console.log(
    `solutions/${chalk.bold(`${year}/${day}`)}`,
    chalk.red("already exists!")
  );
  process.exit(-1);
}

run(year, day, solutionPath);

function getNextDay() {
  const lastDayDir = readdirSync(`solutions/${year}`).pop();
  return `${parseInt(lastDayDir?.split("-")[1] || "0") + 1}`;
}

function getLastYear() {
  return readdirSync(`solutions`).pop() || `${new Date().getFullYear()}`;
}

async function run(year: string, day: string, path: string) {
  if (!existsSync(`solutions/${year}`)) mkdirSync(`solutions/${year}`);
  mkdirSync(path);
  copyFileSync(`template/input-test.txt`, `${path}/input-test.txt`);
  copyFileSync(`template/input-real.txt`, `${path}/input-real.txt`);
  copyFileSync(`template/output.json`, `${path}/output.json`);
  copyFileSync(`template/solver.ts`, `${path}/solver.ts`);

  console.log(
    chalk.grey("aoc"),
    chalk.white(chalk.bold(year)),
    chalk.grey("day"),
    chalk.white(chalk.bold(day)),
    chalk.grey("ready at"),
    chalk.white(chalk.bold(path))
  );
}
