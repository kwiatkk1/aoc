
import { progressLogger } from "../../../utils/debug"

function parse(input: string): string[][] {
  return input.split(",").map(line => line.split("-"));
}

export function solvePart1(input: string): number {
  const ranges = parse(input);
  const invalidIds: number[] = []
  const progress = progressLogger.countTo(ranges.length);

  for (let i = 0; i < ranges.length; i++) {
    const min = parseInt(ranges[i][0]);
    const max = parseInt(ranges[i][1]);

    progress.increment();

    const progress2 = progressLogger.countTo(max - min);

    for (let j = min; j <= max; j++) {
      const str = `${j}`;
      progress2.increment();

      if (str.length % 2 === 0) {
        if (str.substring(0, str.length / 2) === str.substring(str.length / 2)) {
          invalidIds.push(j);
        }
      }
    }
  }

  return invalidIds.reduce((sum, id) => sum + id, 0);
}
export function solvePart2(input: string): number {
  const ranges = parse(input);
  const invalidIds: Set<number> = new Set();
  const progress = progressLogger.countTo(ranges.length);

  for (let i = 0; i < ranges.length; i++) {
    const min = parseInt(ranges[i][0]);
    const max = parseInt(ranges[i][1]);

    progress.increment();

    const progress2 = progressLogger.countTo(max - min);

    for (let j = min; j <= max; j++) {
      const str = `${j}`;
      progress2.increment();

      const m = str.length / 2;

      for (let k = 1; k <= m; k++) {
        const t = str.substring(0, k);

        if (str.split(t).join('') === '') {
          invalidIds.add(j);
        }
      }
    }
  }

  return [...invalidIds].reduce((sum, id) => sum + id, 0);
}
