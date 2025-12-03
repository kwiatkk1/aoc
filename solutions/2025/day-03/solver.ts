type Bank = Array<number>;

const sum = (a: number, b: number) => a + b;

function parse(input: string): Bank[] {
  return input.split("\n").map((line) => line.split("").map(Number));
}

function getMaximumJoltage(batteries: Array<number>, count: number): number {
  const window = batteries.slice(batteries.length - count, batteries.length);

  for (let i = batteries.length - count - 1; i >= 0; i--) {
    let j = 0;
    let k = batteries[i];
    while (j < window.length && k >= window[j]) {
      const p = window[j];
      window[j] = k;
      k = p;
      j += 1;
    }
  }

  return Number(window.join(""));
}

function solverFor(digitsCount: number): (input: string) => number {
  return (input) =>
    parse(input)
      .map((bank) => getMaximumJoltage(bank, digitsCount))
      .reduce(sum);
}

export const solvePart1 = solverFor(2);
export const solvePart2 = solverFor(12);
