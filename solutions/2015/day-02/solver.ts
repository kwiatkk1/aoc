type Dimensions = {
  l: number;
  w: number;
  h: number;
};

function parse(input: string): Dimensions[] {
  return input.split("\n").map((line) => {
    const [l, w, h] = line.split("x").map(Number);
    return { l, w, h };
  });
}

function getRequiredPaper({ l, w, h }: Dimensions): number {
  const sides = [l * w, w * h, h * l];
  const smallest = Math.min(...sides);
  return sides.reduce((sum, it) => sum + 2 * it, smallest);
}

function getRequiredRibbon({ l, w, h }: Dimensions): number {
  const [a, b] = [l, w, h].sort((a, b) => a - b);
  return 2 * a + 2 * b + l * w * h;
}

export function solvePart1(input: string): number {
  return parse(input)
    .map(getRequiredPaper)
    .reduce((sum, it) => sum + it, 0);
}
export function solvePart2(input: string): number {
  return parse(input)
      .map(getRequiredRibbon)
      .reduce((sum, it) => sum + it, 0);
}
