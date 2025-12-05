function parse(input: string) {
  const [rangesInput, availableInput] = input.split("\n\n");

  const ranges = rangesInput
    .split("\n")
    .map((line) => line.split("-").map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const available = availableInput.split("\n").map(Number);

  return { ranges, available };
}

function mergeRanges(ranges: number[][]): number[][] {
  const mergedRanges: number[][] = [];
  let currentRange = ranges[0];

  for (let i = 0; i < ranges.length; i++) {
    const [, currentHi]  = currentRange;
    const [nextLo, nextHi] = ranges[i];

    if (nextLo > currentHi) {
      mergedRanges.push(currentRange);
      currentRange = ranges[i];
      continue;
    }

    if (currentHi <= nextHi) {
      currentRange[1] = nextHi;
    }
  }

  mergedRanges.push(currentRange);

  return mergedRanges;
}

export function solvePart1(input: string): number {
  const { ranges, available } = parse(input);
  return available.filter((id) =>
    ranges.find(([lo, hi]) => id >= lo && id <= hi)
  ).length;
}

export function solvePart2(input: string): number {
  const { ranges } = parse(input);

  return mergeRanges(ranges)
    .map(([lo, hi]) => hi - lo + 1)
    .reduce((sum, it) => sum + it);
}
