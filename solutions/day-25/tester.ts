import { readFileSync } from "fs";
import { solvePart1 } from "./solver";
import { join as pathJoin } from "path";

const inputTest = readFileSync(pathJoin(__dirname, "input-test.txt"), "utf-8");
const inputReal = readFileSync(pathJoin(__dirname, "input-real.txt"), "utf-8");

const expectedTestPart1 = "2=-1=0";

if (expectedTestPart1) {
  const outputTest = solvePart1(inputTest);
  console.log("part1", {
    expected: expectedTestPart1,
    output: outputTest,
    valid: `${expectedTestPart1}` === `${outputTest}`,
  });

  console.log({ solution: solvePart1(inputReal) });
}
