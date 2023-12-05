type Range = {
  from: number;
  to: number;
  diff: number;
};

function getMappingFrom(mapLines: string) {
  const ranges = mapLines
    .split("\n")
    .map((line): Range => {
      const [dstStart, srcStart, length] = line
        .split(" ")
        .map((it) => parseInt(it));
      return {
        from: srcStart,
        to: srcStart + length,
        diff: dstStart - srcStart,
      };
    })
    .sort((a, b) => a.from - b.from);

  const [{ from: min }] = ranges;
  const [maxNegative] = ranges
    .filter((it) => it.diff < 0)
    .map((it) => it.to)
    .sort((a, b) => b - a);

  return function map(num: number) {
    if (num < min) return num;
    if (num > maxNegative) return num;

    for (let range of ranges) {
      if (num < range.from) return num;

      if (num >= range.from && num < range.to) {
        return num + range.diff;
      }
    }

    return num;
  };
}

function parse(input: string) {
  const [seedsLine, ...mappingsLines] = input
    .split("\n\n")
    .map((it) => it.split(/:\s/)[1]);

  return {
    seeds: seedsLine.split(" ").map((it) => parseInt(it)),
    mappings: mappingsLines.map((it) => getMappingFrom(it)),
  };
}

export function solvePart1(input: string): number {
  const { seeds, mappings } = parse(input);

  return seeds.reduce((min, seed) => {
    const mapped = mappings.reduce((current, map) => map(current), seed);

    return mapped < min ? mapped : min;
  }, Infinity);
}

export function solvePart2(input: string): number {
  const { seeds, mappings } = parse(input);
  let min = Infinity;

  for (let i = 0; i < seeds.length / 2; i++) {
    let start = seeds[i * 2];
    let count = seeds[i * 2 + 1];

    for (let j = 0; j < count; j++) {
      const seed = start + j;
      const mapped = mappings.reduce((current, map) => map(current), seed);

      if (mapped < min) min = mapped;
    }
  }

  return min;
}
