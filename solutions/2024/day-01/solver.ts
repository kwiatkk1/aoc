const whitespace = /\s+/;
const asc = (a: number, b: number) => a - b;
const odd = (it: any, i: number) => i % 2;
const even = (it: any, i: number) => i % 2 === 0;
const parseLocation = (text: string) => parseInt(text);

function parse(input: string) {
  const locations = input.split(whitespace).map(parseLocation);

  return {
    listA: locations.filter(odd),
    listB: locations.filter(even),
  };
}

export function solvePart1(input: string): number {
  const { listA, listB } = parse(input);

  listA.sort(asc);
  listB.sort(asc);

  return listA
    .map((it, i) => [it, listB[i]])
    .map((pair) => Math.abs(pair[0] - pair[1]))
    .reduce((sum, distance) => sum + distance);
}

export function solvePart2(input: string): number {
  const { listA, listB } = parse(input);

  const occurrencesInB = listB.reduce<Record<number, number>>((acc, it) => {
    acc[it] = (acc[it] || 0) + 1;
    return acc;
  }, {});

  return listA
    .map((it) => it * (occurrencesInB[it] || 0))
    .reduce((sum, score) => sum + score);
}
