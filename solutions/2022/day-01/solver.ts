export function solvePart1(input: string): number {
  return input
    .split("\n\n")
    .map((input) =>
      input
        .split("\n")
        .map((n) => parseInt(n))
        .reduce((acc, it) => acc + it)
    )
    .map((it, i) => ({ i, it }))
    .sort((a, b) => b.it - a.it)[0]
    .it;
}

export function solvePart2(input: string): number {
  return input
    .split("\n\n")
    .map((input) =>
      input
        .split("\n")
        .map((n) => parseInt(n))
        .reduce((acc, it) => acc + it)
    )
    .map((it, i) => ({ i, it }))
    .sort((a, b) => b.it - a.it)
    .slice(0, 3)
    .reduce((sum, { it }) => sum + it, 0);
}
