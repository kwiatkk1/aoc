function parse(input: string): number[] {
  return input.split("\n").map((line): number => {
    const sign = line.startsWith("L") ? -1 : 1;
    return parseInt(line.substring(1), 10) * sign;
  });
}

export function solvePart1(input: string): number {
  const data = parse(input);
  const start = 50;
  let count = 0;

  data.reduce((acc, cur) => {
    const next = (100 + ((acc + cur) % 100)) % 100;
    if (next === 0) count += 1;
    return next;
  }, start);

  return count;
}
export function solvePart2(input: string): number {
  const data = parse(input);
  const start = 50;
  let count = 0;

  data.reduce((acc, cur) => {
    let next = acc;
    while (cur) {
      next += cur > 0 ? 1: -1;
      next %= 100;
      if (next === 0) count += 1;
      cur += cur > 0 ? -1 : 1;
    }
    return next;
  }, start);

  return count;
}
