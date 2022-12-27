import { readFileSync } from "fs";
import { solvePart2 } from "./solver";
import { join as pathJoin } from "path";

const inputTest = readFileSync(pathJoin(__dirname, "input-test.txt"), "utf-8");
const inputReal = readFileSync(pathJoin(__dirname, "input-real.txt"), "utf-8");

const expectedTestPart2 = 1707;

if (expectedTestPart2) {
  const outputTest = solvePart2(inputTest);
  console.log({
    expected: expectedTestPart2,
    output: outputTest,
    valid: `${expectedTestPart2}` === `${outputTest}`,
  });

  console.log(' ');
  console.log('------------------------------------------------------------------');
  console.log(' ');

  console.log({ output: solvePart2(inputReal) });
}
