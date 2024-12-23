import { progressLogger } from "../../../utils/debug";

type Computer = {
  name: string;
  connections: Computer[];
};

const getKey = (computers: Computer[]) =>
  computers
    .map((c) => c.name)
    .sort()
    .join(",");

function parse(input: string) {
  const connections = input.split("\n").map((line) => line.split("-"));
  const computers: Map<string, Computer> = new Map();

  connections.forEach(([src, dst]) => {
    if (!computers.has(src)) {
      computers.set(src, { name: src, connections: [] });
    }
    if (!computers.has(dst)) {
      computers.set(dst, { name: dst, connections: [] });
    }
    computers.get(src)!.connections.push(computers.get(dst)!);
    computers.get(dst)!.connections.push(computers.get(src)!);
  });

  return computers;
}

function getThree(computer: Computer) {
  const paths: Computer[][] = [];

  if (computer.connections.length > 2) {
    for (let i = 0; i < computer.connections.length; i++) {
      for (let j = i + 1; j < computer.connections.length; j++) {
        const b = computer.connections[i];
        const c = computer.connections[j];
        if (b.connections.includes(c)) {
          paths.push([computer, b, c]);
        }
      }
    }
  }

  return paths;
}

function expand(group: Computer[], seen: Set<string>): Computer[][] {
  const key = getKey(group);

  if (seen.has(key)) return [];
  seen.add(key);

  const allConnections = [...new Set(group.flatMap((c) => c.connections))];
  const toAdd = allConnections.filter(
    (c) => !group.includes(c) && group.every((p) => c.connections.includes(p))
  );

  const paths: Computer[][] = [];

  progressLogger.print(`testing path: ${getKey(group)}`);

  if (toAdd.length === 0) return [group];

  while (toAdd.length > 0) {
    const candidate = toAdd.pop()!;
    expand([...group, candidate], seen).forEach((p) => paths.push(p));
  }

  const [max] = paths.map((p) => p.length).sort((a, b) => b - a);
  return paths.filter((p) => p.length === max);
}

export function solvePart1(input: string): number {
  const nodes = parse(input);
  const sets = new Set<string>();

  nodes.forEach((computer) => {
    getThree(computer)
      .filter((path) => path.some((c) => c.name.startsWith("t")))
      .map(getKey)
      .forEach((p) => sets.add(p));
  });

  return sets.size;
}

export function solvePart2(input: string) {
  const nodes = parse(input);
  const sets = new Set<string>();
  const memo = new Set<string>();

  nodes.forEach((computer) => {
    expand([computer], memo)
      .map(getKey)
      .forEach((p) => sets.add(p));
  });

  const [largest] = [...sets].sort((a, b) => b.length - a.length);
  return largest;
}
