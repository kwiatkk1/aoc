import { parseArgs } from "node:util";
import assert from "node:assert";
import chalk from "chalk";
import { readdirSync, readFileSync, existsSync, writeFileSync } from "fs";

const { values: args } = parseArgs({
  options: {
    year: { type: "string" },
    day: { type: "string" },
    part: { type: "string", multiple: true, default: ["1", "2"] },
    test: { type: "boolean" },
    noTest: { type: "boolean" },
    save: { type: "boolean" },
  },
});

const year = args.year || getLastYear() || "";
const day = (args.day || getLastDay() || "").padStart(2, "0");
const parts = Array.isArray(args.part) ? args.part : ["1", "2"];
const testsOnly = !!args.test;
const noTests = !!args.noTest;
const saveOutput = !!args.save;
const solutionPath = `solutions/${year}/day-${day}`;

assert(existsSync(solutionPath), `no solutions for ${year}/${day}`);

run(year, day, solutionPath);

function getLastDay() {
  const lastDayDir = readdirSync(`solutions/${year}`).pop();
  return lastDayDir?.split("-")[1];
}

function getLastYear() {
  return readdirSync(`solutions`).pop();
}

async function run(year: string, day: string, path: string) {
  const solverCode = await import(`./${path}/solver.ts`);
  const expectedOutputs = await import(`./${path}/output.json`).catch(() => {});
  const files = readdirSync(path);

  const testFiles = files.filter(
    (it) => it.startsWith("input-test") && it.endsWith(".txt")
  );
  const realFiles = files.filter(
    (it) => it.startsWith("input-real") && it.endsWith(".txt")
  );
  const filesToRun = testsOnly
    ? testFiles
    : noTests
    ? realFiles
    : [...testFiles, ...realFiles];
  const results: any = {};

  for (let part of parts) {
    let fileNumber = 0;

    if (typeof solverCode[`solvePart${part}`] !== "function") continue;

    for (let file of filesToRun) {
      fileNumber += 1;
      const name = file.slice("input-".length, -1 * ".txt".length);
      const inputPath = `./${path}/${file}`;
      const input = readFileSync(inputPath, "utf-8");
      const expected =
        typeof expectedOutputs?.[name]?.[`part${part}`] !== "undefined"
          ? `${expectedOutputs?.[name]?.[`part${part}`]}`
          : null;

      console.log(
        chalk.grey("aoc"),
        chalk.white(chalk.bold(year)),
        chalk.grey("day"),
        chalk.white(chalk.bold(day)),
        chalk.grey("part"),
        chalk.white(chalk.bold(part)),
        chalk.grey("file"),
        chalk.white(chalk.bold(`#${fileNumber}`)),
        chalk.grey(`(${file})`)
      );

      const result = solverCode[`solvePart${part}`](input);
      const resultText = `${result}`;

      if (expected !== null) {
        const isValid = expected === resultText;
        const isNumber =
          typeof result === "number" && !isNaN(parseInt(expected));
        const maxLength = Math.max(resultText.length, expected.length);
        let diffText = isValid
          ? chalk.grey(`(${chalk.greenBright("CORRECT")})`)
          : "";

        if (isNumber && !isValid) {
          const diff = parseInt(expected) - result;
          const too = chalk.red(diff > 0 ? "🔻TOO_LOW" : "🔺TOO_HIGH");
          diffText = chalk.grey(`(${too} diff=${Math.abs(diff)})`);
        }

        if (!isValid)
          console.log(
            chalk.grey("  expected:"),
            `${expected.padStart(maxLength, " ")}`
          );
        console.log(
          chalk.grey("    result:"),
          chalk[isValid ? "green" : "red"](resultText.padStart(maxLength, " ")),
          diffText
        );
      } else {
        console.log(chalk.grey("    result:"), resultText);
      }

      results[name] = results[name] || {};
      results[name][`part${part}`] = result;
    }
  }

  if (saveOutput) {
    writeFileSync(
      `./${path}/output.json`,
      JSON.stringify(results, null, 2),
      "utf8"
    );
  }
}
