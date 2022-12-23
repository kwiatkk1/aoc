import { readFileSync } from "fs";
import { solvePart2Real, solvePart2Test } from "./solver";
import { join as pathJoin } from "path";

const inputTest = readFileSync(pathJoin(__dirname, "input-test.txt"), "utf-8");
const inputReal = readFileSync(pathJoin(__dirname, "input-real.txt"), "utf-8");

const expectedTestPart2 = 5031;

if (expectedTestPart2) {
  const outputTest = solvePart2Test(inputTest);
  console.log("part2", {
    expected: expectedTestPart2,
    output: outputTest,
    valid: `${expectedTestPart2}` === `${outputTest}`,
  });

  console.log({ solution: solvePart2Real(inputReal) });
  // 17434 too low,
  // 85234 too low,
  // 113267 too low,
}
