function parse(input: string): number[][] {
  return input.split("\n").map((it) => it.split(" ").map((it) => parseInt(it)));
}

function isSafe(report: number[]): boolean {
  const [first, second] = report;
  const expectedSign = Math.sign(second - first);

  for (let i = 1; i < report.length; i++) {
    const diff = report[i] - report[i - 1];
    const value = Math.abs(diff);
    const sign = Math.sign(diff);
    if (sign !== expectedSign || value < 1 || value > 3) return false;
  }

  return true;
}

function isSafeWithOneRemoval(report: number[]): boolean {
  const toCheck = [
    report,
    ...report.map((_, i, all) => [...all.slice(0, i), ...all.slice(i + 1)]),
  ];
  return toCheck.some(isSafe);
}

export function solvePart1(input: string): number {
  const reports = parse(input);
  return reports.filter(isSafe).length;
}
export function solvePart2(input: string): number {
  const reports = parse(input);
  return reports.filter(isSafeWithOneRemoval).length;
}
