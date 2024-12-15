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

class AocProgressLogger {
  private linesAdded = 0;
  private throttle = 200;
  private lastCall = 0;

  print(message: string) {
    if (Date.now() - this.lastCall < this.throttle) return;
    if (this.linesAdded) process.stdout.moveCursor(0, -1 * this.linesAdded);
    process.stdout.clearScreenDown();
    process.stdout.write(message + "\n");
    this.linesAdded = message.split("\n").length;
    this.lastCall = Date.now();
  }

  clear() {
    if (this.linesAdded) process.stdout.moveCursor(0, -1 * this.linesAdded);
    process.stdout.clearScreenDown();
    this.linesAdded = 0;
  }
}

export function getProgressLogger() {
  return new AocProgressLogger();
}

export const progressLogger = getProgressLogger();