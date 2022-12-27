import { readFileSync } from "fs";
import { solvePart1, solvePart2 } from "./solver";
import { join as pathJoin } from "path";

const inputTest = readFileSync(pathJoin(__dirname, "input-test.txt"), "utf-8");
const inputReal = readFileSync(pathJoin(__dirname, "input-real.txt"), "utf-8");

const expectedTestPart1 = 3068;
const expectedTestPart2 = 1514285714288;

if (expectedTestPart1) {
  const outputTest = solvePart1(inputTest);
  console.log("part1 / test", {
    expected: expectedTestPart1,
    output__: outputTest,
    valid: `${expectedTestPart1}` === `${outputTest}`,
    diff: outputTest - expectedTestPart1,
  });

  const outputReal = solvePart1(inputReal);
  console.log("part1 / real", {
    expected: 3202,
    output__: outputReal,
    valid: `${3202}` === `${outputReal}`,
    diff: outputReal - 3202,
  });
}

if (expectedTestPart2) {
  const outputTest = solvePart2(inputTest);
  console.log("part2 / test", {
    expected: expectedTestPart2,
    output__: outputTest,
    valid: `${expectedTestPart2}` === `${outputTest}`,
    diff: outputTest - expectedTestPart2,
  });

  console.log({ solution: solvePart2(inputReal) });
}
