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

  while (current.name !== "ZZZ") {
    const cmd = data.cmds[currentCmd];

    if (cmd === "R") {
      current = current.right;
    } else {
      current = current.left;
    }

    steps += 1;
    currentCmd = (currentCmd + 1) % data.cmds.length;
  }

  return steps;
}
export function solvePart2(input: string): number {
  const data = parse(input);

  let steps = 0;
  let currentCmd = 0;
  let currents = data.nodes.filter((node) => node.name.endsWith("A"));
  let allDone = false;

  while (!allDone) {
    const cmd = data.cmds[currentCmd];

    currents = currents.map((current) => {
      return cmd === "R" ? current.right : current.left;
    }) as Node[];

    allDone = currents.every((it) => it.name.endsWith("Z"));
    steps += 1;
    currentCmd = (currentCmd + 1) % data.cmds.length;
  }

  return steps;
}
