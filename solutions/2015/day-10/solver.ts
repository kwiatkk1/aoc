type Group = {
  number: number;
  count: number;
};

function parse(input: string) {
  return input.split("").map(Number);
}

function transform(data: number[]): number[] {
  const groups: Group[] = [{ number: data[0], count: 1 }];

  for (let i = 1; i < data.length; i++) {
    const lastGroup = groups[groups.length - 1];

    if (lastGroup.number === data[i]) {
      lastGroup.count += 1;
    } else {
      groups.push({ number: data[i], count: 1 });
    }
  }

  return groups.flatMap((group) => [group.count, group.number]);
}

function getLength(data: number[], remaining: number): number {
  if (!remaining) return data.length;
  return getLength(transform(data), remaining - 1);
}

export function solvePart1(input: string) {
  return getLength(parse(input), 40);
}
export function solvePart2(input: string) {
  return getLength(parse(input), 50);
}
