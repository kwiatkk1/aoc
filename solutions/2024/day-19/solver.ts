import { memoize } from "lodash";

const sum = (a: number, b: number) => a + b;

function parse(input: string) {
  const [towels, designs] = input.split("\n\n");
  return {
    towels: towels.split(", "),
    designs: designs.split("\n"),
  };
}

export function solvePart1(input: string): number {
  const { towels, designs } = parse(input);

  const isPossibleMemo = memoize(isPossible);

  function isPossible(design: string): boolean {
    return towels.map((towel) => {
      if (design === towel) return true;
      if (!design.startsWith(towel)) return false;
      return isPossibleMemo(design.slice(towel.length));
    }).some(Boolean);
  }

  return designs.map(isPossibleMemo).filter(Boolean).length;
}
export function solvePart2(input: string): number {
  const { towels, designs } = parse(input);

  const getPossibilitiesMemo = memoize(getPossibilities);

  function getPossibilities(design: string): number {
    return towels
      .map((towel) => {
        if (design === towel) return 1;
        if (!design.startsWith(towel)) return 0;
        return getPossibilitiesMemo(design.slice(towel.length));
      })
      .reduce(sum);
  }

  return designs.map(getPossibilitiesMemo).reduce(sum);
}
