import readline from "readline/promises";
import { whiteBright, white } from "chalk";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export async function debugStep({
  step,
  print = () => {},
}: {
  step: Function;
  print: Function;
}) {
  step();

  if (process.env.DEBUG_AOC === "true") {
    print();
    const answer = await rl.question(
      [
        white(`(${whiteBright("q")}) to quit, `),
        white(`(${whiteBright("r")}) to skip debug. `),
        "Press enter to continue...",
      ].join("")
    );

    if (answer === "q") process.exit();
    if (answer === "r") process.env.DEBUG_AOC = "false";

    // delete prompt
    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine(1);
  }
}
