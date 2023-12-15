type Cmd = DeleteCmd | UpsertCmd;

type DeleteCmd = {
  kind: "delete";
  label: string;
  box: number;
};

type UpsertCmd = {
  kind: "upsert";
  label: string;
  box: number;
  value: number;
};

type Lens = {
  label: string;
  value: number;
};

function parse(input: string): string[] {
  return input.split("\n")[0].split(",");
}

function toHash(str: string): number {
  return str
    .split("")
    .reduce((acc, char) => ((acc + char.charCodeAt(0)) * 17) % 256, 0);
}

function toCommand(str: string): Cmd {
  const [a, value] = str.split("=");
  const [label, rest] = a.split("-");
  const box = toHash(label);

  return typeof value === "undefined"
    ? { kind: "delete", label, box }
    : { kind: "upsert", label, box, value: parseInt(value) };
}

function sum(a: number, b: number): number {
  return a + b;
}

export function solvePart1(input: string): number {
  return parse(input).map(toHash).reduce(sum, 0);
}
export function solvePart2(input: string): number {
  const commands = parse(input).map(toCommand);
  const boxes: Lens[][] = Array(256)
    .fill(0)
    .map(() => []);

  commands.forEach((cmd) => {
    const lenses = boxes[cmd.box];
    const index = lenses.findIndex(({ label }) => label === cmd.label);
    const isFound = index !== -1;

    if (cmd.kind === "delete") {
      if (isFound) lenses.splice(index, 1);
    }

    if (cmd.kind === "upsert") {
      if (isFound) lenses[index].value = cmd.value;
      else lenses.push({ label: cmd.label, value: cmd.value });
    }
  });

  return boxes
    .flatMap((lenses, boxI) =>
      lenses.map((lens, pos) => (boxI + 1) * (pos + 1) * lens.value)
    )
    .reduce(sum, 0);
}
