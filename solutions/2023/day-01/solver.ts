function solve(input: string, mappings: Record<string, number>): number {
  const keys = Object.keys(mappings);
  const lines = input.split("\n");

  const linesValues = lines.map((line) => {
    const occurrences = keys.map((key) => ({
      value: mappings[key],
      first: line.indexOf(key),
      last: line.lastIndexOf(key),
    }));

    const first =
      occurrences
        .filter((it) => it.first > -1)
        .sort((a, b) => a.first - b.first)[0]?.value || 0;

    const last =
      occurrences
        .filter((it) => it.last > -1)
        .sort((a, b) => b.last - a.last)[0]?.value || 0;

    return first * 10 + last;
  });

  return linesValues.reduce((sum, it) => sum + it, 0);
}

export function solvePart1(input: string): number {
  const mappings: Record<string, number> = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
  };

  return solve(input, mappings);
}

export function solvePart2(input: string): number {
  const mappings: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
  };

  return solve(input, mappings);
}
