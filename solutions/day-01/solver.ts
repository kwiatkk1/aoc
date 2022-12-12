export function solvePart1(input: string): string {
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
    .it.toString();
}

export function solvePart2(input: string): string {
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
    .reduce((sum, { it }) => sum + it, 0)
    .toString();
}
