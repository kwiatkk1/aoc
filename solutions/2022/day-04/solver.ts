function parsePairs(input: string) {
  const pairs = input.split("\n");
  return pairs.map((pi) =>
    pi
      .split(",")
      .map((ei) => ei.split("-").map((n) => parseInt(n)))
      .sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]))
  );
}

export function solvePart1(input: string): number {
  const pairs = parsePairs(input);
  return pairs.filter(
    (pair) =>
      (pair[0][0] <= pair[1][0] && pair[0][1] >= pair[1][1]) ||
      pair[0][0] === pair[1][0]
  ).length;
}

export function solvePart2(input: string): number {
  const pairs = parsePairs(input);

  return pairs.filter(([first, second]) => first[1] >= second[0]).length;
}
