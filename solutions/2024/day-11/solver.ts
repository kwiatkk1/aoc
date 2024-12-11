import { memoize } from "lodash";

function parse(input: string): string[] {
  return input.split(" ");
}

function blink(stones: string[]): void {
  for (let i = stones.length - 1; i >= 0; i--) {
    const stone = stones[i];
    if (stone === "0") {
      stones[i] = "1";
    } else if (stone.length % 2 === 0) {
      const left = stone.substring(0, stone.length / 2);
      const right = `${parseInt(stone.substring(stone.length / 2))}`;
      stones[i] = left;
      stones.splice(i + 1, 0, right);
    } else {
      stones[i] = `${parseInt(stone) * 2024}`;
    }
  }
}

function getStonesCount(stone: string, remainingRounds: number): number {
  if (remainingRounds === 0) return 1;

  if (stone === "0") {
    return getStonesCountMemo("1", remainingRounds - 1);
  } else if (stone === "1") {
    return getStonesCountMemo("2024", remainingRounds - 1);
  } else if (stone.length % 2 === 0) {
    const l = stone.substring(0, stone.length / 2);
    const r = `${parseInt(stone.substring(stone.length / 2))}`;
    return (
      getStonesCountMemo(l, remainingRounds - 1) +
      getStonesCountMemo(r, remainingRounds - 1)
    );
  } else {
    return getStonesCountMemo(`${parseInt(stone) * 2024}`, remainingRounds - 1);
  }
}

const getStonesCountMemo = memoize(
  getStonesCount,
  (stone, i) => `${stone}-${i}`
);

function solveSimulated(input: string, rounds: number): number {
  const stones = parse(input);

  for (let i = 0; i < rounds; i++) {
    blink(stones);
  }

  return stones.length;
}

function solveOptimized(input: string, rounds: number): number {
  return parse(input)
    .map((stone) => getStonesCountMemo(stone, rounds))
    .reduce((acc, curr) => acc + curr, 0);
}

export function solvePart1(input: string): number {
  // return solveSimulated(input, 25);
  return solveOptimized(input, 25);
}

export function solvePart2(input: string): number {
  return solveOptimized(input, 75);
}
