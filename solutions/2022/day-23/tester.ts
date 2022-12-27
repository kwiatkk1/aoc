import { readFileSync } from "fs";
import { solvePart1, solvePart2 } from "./solver";
import { join as pathJoin } from "path";

const inputSmall = readFileSync(pathJoin(__dirname, "input-small.txt"), "utf-8");
const inputTest = readFileSync(pathJoin(__dirname, "input-test.txt"), "utf-8");
const inputReal = readFileSync(pathJoin(__dirname, "input-real.txt"), "utf-8");

const expectedTestPart1 = 110;
const expectedTestPart2 = 20;

if (expectedTestPart1) {
  solvePart1(inputSmall);

  const outputTest = solvePart1(inputTest);
  console.log("part1", {
    expected: expectedTestPart1,
    output: outputTest,
    valid: `${expectedTestPart1}` === `${outputTest}`,
  });

  console.log({ solution: solvePart1(inputReal) });
}

if (expectedTestPart2) {
  const outputTest = solvePart2(inputTest);
  console.log("part2", {
    expected: expectedTestPart2,
    output: outputTest,
    valid: `${expectedTestPart2}` === `${outputTest}`,
  });

  console.log({ solution: solvePart2(inputReal) });
}