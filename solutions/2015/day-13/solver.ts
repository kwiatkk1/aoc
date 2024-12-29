type Path = { src: string; dst: string; cost: number };

function parse(input: string): Path[] {
  return input.split("\n").map((line) => {
    const [src, rest1] = line.split(" would ");
    const [what, rest2] = rest1.split(" happiness units by sitting next to ");
    const [dst] = rest2.split(".");
    const [type, value] = what.split(" ");
    const cost = (type === "lose" ? -1 : 1) * parseInt(value);
    return { src, dst, cost };
  });
}

function getAllOptions(names: string[]): string[][] {
  if (names.length === 1) return [names];
  return names.flatMap((name) => {
    const rest = names.filter((it) => it !== name);
    return getAllOptions(rest).map((it) => [name, ...it]);
  });
}

function getHappiness(arrangement: string[], data: Path[]) {
  let total = 0;
  for (let i = 0; i < arrangement.length; i++) {
    const src = arrangement[i];
    const dst1 = arrangement[(arrangement.length + i - 1) % arrangement.length];
    const dst2 = arrangement[(arrangement.length + i + 1) % arrangement.length];
    const cost1 =
      data.find((it) => it.src === src && it.dst === dst1)?.cost || 0;
    const cost2 =
      data.find((it) => it.src === src && it.dst === dst2)?.cost || 0;
    total += cost1 + cost2;
  }
  return total;
}

function solve(input: string, extra: string[] = []) {
  const data = parse(input);
  const names = [...new Set(data.map((it) => it.src)), ...extra];
  const allOptions = getAllOptions(names);

  return allOptions.reduce(
    (max, arrangement) => Math.max(max, getHappiness(arrangement, data)),
    0
  );
}

export const solvePart1 = (input: string) => solve(input);
export const solvePart2 = (input: string) => solve(input, ["me"]);
