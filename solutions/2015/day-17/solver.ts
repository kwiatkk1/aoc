type Bucket = { number: number; volume: number };

function parse(input: string): Bucket[] {
  return input.split("\n").map((it, i) => ({ number: i, volume: Number(it) }));
}

const sum = (a: number, b: number) => a + b;

function findThatSumsTo(containers: Bucket[], limit: number): Set<Bucket>[] {
  if (limit < 0) return [];
  if (limit === 0) return [new Set([])];

  const sets: Set<Bucket>[] = containers.flatMap((it, i, rest) => {
    return findThatSumsTo(
      [...rest.slice(0, i), ...rest.slice(i + 1)],
      limit - it.volume
    ).map((res) => new Set([it, ...res]));
  });

  return sets.filter(
    (it) => [...it].map((it) => it.volume).reduce(sum) === limit
  ).reduce<Set<Bucket>[]>((unique, set) => {
    const key = [...set].map(i => i.number).sort().join(',');

    if (!unique.find(it => [...it].map(i => i.number).sort().join(',') === key)) {
      unique.push(set);
    }
    return unique;
  }, [])
}

export function solvePart1(input: string): number {
  const containers = parse(input);

  return findThatSumsTo(containers, 150).length;
}

export function solvePart2(input: string): number {
  const data = parse(input);
  return data.length;
}
