type Range = {
  fromStart: number;
  fromStop: number;
  diff: number;
};

function printRange(range: Range) {
  const toHundred = Array(100)
    .fill(0)
    .map((_, i) => (i >= range.fromStart && i < range.fromStop ? "x" : " "))
    .join("");
  return `${range.diff.toString().padStart(5, " ")}: ${toHundred}`;
}

function mergeRanges(a: Range[], b: Range[]): Range[] {
  const result: Range[] = [];
  const max = Math.max(a[a.length - 1].fromStop, b[b.length - 1].fromStop);
  let current = Math.min(a[0].fromStart, b[0].fromStart);

  while (current < max) {
    const matchedA = a.find(
      (it) => it.fromStart <= current && it.fromStop > current
    );
    const nextA = a.find((it) => it.fromStart > current);
    const matchedB = b.find(
      (it) => it.fromStart <= current && it.fromStop > current
    );
    const nextB = b.find((it) => it.fromStart > current);

    const nextBreak = Math.min(
      matchedA ? matchedA.fromStop : nextA?.fromStart || Infinity,
      matchedB ? matchedB.fromStop : nextB?.fromStart || Infinity
    );

    if (!matchedA && matchedB) {
      result.push({
        fromStart: current,
        fromStop: nextBreak,
        diff: matchedB?.diff,
      });
      current = nextBreak;
      continue;
    }

    if (matchedA) {
      const bAdjusted = b.map((it) => ({
        ...it,
        fromStart: it.fromStart - matchedA.diff,
        fromStop: it.fromStop - matchedA.diff,
      }));
      let subCurrent = current;

      while (subCurrent < matchedA.fromStop) {
        const matchedB = bAdjusted.find(
          (it) => it.fromStart <= subCurrent && it.fromStop > subCurrent
        );
        const nextB = bAdjusted.find((it) => it.fromStart > subCurrent);

        const nextBreak = Math.min(
          matchedB ? matchedB.fromStop : nextB?.fromStart || Infinity,
          matchedA.fromStop
        );

        if (!matchedB) {
          result.push({
            fromStart: subCurrent,
            fromStop: nextBreak,
            diff: matchedA?.diff,
          });
          subCurrent = nextBreak;
          continue;
        }

        if (matchedB) {
          result.push({
            fromStart: subCurrent,
            fromStop: nextBreak,
            diff: matchedB?.diff + matchedA?.diff,
          });
          subCurrent = nextBreak;
          continue;
        }

        subCurrent = nextBreak;
      }

      current = matchedA.fromStop;
    }
  }

  return result;
}

function getMergedRanges(mapsLines: string[]) {
  const maps = mapsLines.map((line) =>
    line
      .split("\n")
      .map((line): Range => {
        const [dst, src, size] = line.split(" ").map((it) => parseInt(it));
        return {
          fromStart: src,
          fromStop: src + size,
          diff: dst - src,
        };
      })
      .sort((a, b) => a.fromStart - b.fromStart)
  );

  const [first, ...rest] = maps;
  return rest.reduce((merged, range) => mergeRanges(merged, range), first);
}

function parse(input: string) {
  const [seedsLine, ...mappingsLines] = input
    .split("\n\n")
    .map((it) => it.split(/:\s/)[1]);
  const seedsSingle = seedsLine.split(" ").map((it) => parseInt(it));
  const seedsRanges = seedsSingle.reduce((ranges, seed, currentIndex) => {
    if (currentIndex % 2) {
      ranges.push({ start: seedsSingle[currentIndex - 1], count: seed });
    }
    return ranges;
  }, [] as Array<{ start: number; count: number }>);

  return {
    seedsSingle,
    seedsRanges,
    ranges: getMergedRanges(mappingsLines),
  };
}

export function solvePart1(input: string): number {
  const { seedsSingle, ranges } = parse(input);

  return seedsSingle.reduce((min, seed) => {
    const range = ranges.find(
      ({ fromStart, fromStop }) => fromStart <= seed && seed < fromStop
    );
    const diff = range?.diff || 0;
    return Math.min(min, seed + diff);
  }, Infinity);
}

export function solvePart2(input: string): number {
  const { seedsRanges, ranges } = parse(input);

  const finalRanges = seedsRanges.flatMap((it) => {
    const seedStart = it.start;
    const seedStop = it.start + it.count;

    const atStart = ranges.find(
      (r) => r.fromStart < seedStart && r.fromStop > seedStart
    );
    const contained = ranges.filter(
      (r) => r.fromStart >= seedStart && r.fromStop <= seedStop
    );
    const atStop = ranges.find(
      (r) => r.fromStart < seedStop && r.fromStop > seedStop
    );

    const start = atStart ? { ...atStart, fromStart: seedStart } : null;
    const stop = atStop ? { ...atStop, fromStop: it.start + it.count } : null;

    return [start, ...contained, stop].flatMap((it) => (it ? [it] : []));
  });

  return finalRanges.reduce(
    (min, r) => Math.min(min, r.fromStart + r.diff, r.fromStop + r.diff),
    Infinity
  );
}
