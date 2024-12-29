export function solvePart1(input: string): number {
  return [...input.matchAll(/(-?\d+)/g)]
    .map((it) => parseInt(it[0]))
    .reduce((sum, it) => sum + it, 0);
}
export function solvePart2(input: string): number {
  const revived = JSON.parse(input, function (key, value) {
    return !Array.isArray(value) && Object.values(value).includes("red")
      ? undefined
      : value;
  });

  return solvePart1(JSON.stringify(revived));
}
