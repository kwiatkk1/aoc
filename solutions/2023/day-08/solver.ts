import { keyBy } from "lodash";

type Cmd = "R" | "L";

type Node = {
  name: string;
  left: Node;
  right: Node;
  leftName: string;
  rightName: string;
};

function parse(input: string) {
  const [commands, rest] = input.split("\n\n");

  const cmds = commands.split("") as Cmd[];
  const nodes = rest.split("\n").map((line) => {
    const [name, linksText] = line.split(" = ");
    const [leftName, rightName] = linksText
      .substring(1, linksText.length - 1)
      .split(", ");
    return {
      name,
      leftName,
      rightName,
      left: {},
      right: {},
    };
  });

  const map = keyBy(nodes, (it) => it.name) as Record<string, Node>;

  nodes.forEach((node) => {
    node.left = map[node.leftName];
    node.right = map[node.rightName];
  });

  return {
    cmds,
    nodes,
    map,
  };
}

export function solvePart1(input: string): number {
  const data = parse(input);

  let steps = 0;
  let currentCmd = 0;
  let current = data.map["AAA"];

  while (current && current.name !== "ZZZ") {
    current = data.cmds[currentCmd] === "R" ? current.right : current.left;
    steps += 1;
    currentCmd = (currentCmd + 1) % data.cmds.length;
  }

  return steps;
}

const gcd = (a: number, b: number) => {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
};

const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

export function solvePart2(input: string): number {
  const data = parse(input);
  const starts = data.nodes.filter((node) => node.name.endsWith("A")) as Node[];

  // detect cycles
  const cycles = starts.map((startNode) => {
    let step = 0;
    let cmdIndex = 0;
    let current = startNode;

    while (!current.name.endsWith("Z")) {
      current = data.cmds[cmdIndex] === "L" ? current.left : current.right;
      cmdIndex = (cmdIndex + 1) % data.cmds.length;
      step += 1;
    }

    return step;
  });

  return cycles.reduce(lcm, 1);
}
