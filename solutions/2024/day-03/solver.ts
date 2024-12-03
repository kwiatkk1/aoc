function parse(input: string): number[][] {
  return input
    .split("mul")
    .map((it) => it.substring(0, "(xxx,xxx)".length))
    .map((it) => it.match(/\((\d{1,3}),(\d{1,3})\)/))
    .flatMap((it) => (it ? [[parseInt(it[1]), parseInt(it[2])]] : []));
}

function clear(input: string): string {
  const enableCmd = "do()";
  const disableCmd = "don't()";
  const acc: string[] = [];
  let enabled = true;
  let current = "";

  input.split("").forEach((char) => {
    current += char;
    if (current.endsWith(disableCmd)) {
      if (enabled) acc.push(current);
      current = "";
      enabled = false;
    }
    if (current.endsWith(enableCmd)) {
      if (enabled) acc.push(current);
      current = "";
      enabled = true;
    }
  });

  if (current && enabled) acc.push(current);

  return acc.join("");
}

export function solvePart1(input: string): number {
  const data = parse(input);
  return data.map(([a, b]) => a * b).reduce((sum, it) => sum + it, 0);
}
export function solvePart2(input: string): number {
  return solvePart1(clear(input));
}
