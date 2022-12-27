type Node = {
  value: number;
  x: number;
  y: number;
  start: boolean;
  exit: boolean;
};

type GraphNode = Node & {
  distance: number;
  prev: GraphNode | null;

  left: GraphNode | null;
  right: GraphNode | null;
  top: GraphNode | null;
  bottom: GraphNode | null;
};

function parse(input: string): Node[] {
  return input.split("\n").flatMap((line, row) =>
    line.split("").map((char, column) => ({
      value:
        char === "S"
          ? 0
          : char === "E"
          ? 25
          : char.charCodeAt(0) - "a".charCodeAt(0),
      x: column,
      y: row,
      start: char === "S",
      exit: char === "E",
    }))
  );
}

function buildGraph(model: Node[], part2: boolean = false): GraphNode[] {
  const graphNodes: GraphNode[] = [...model].map((node) => {
    const left = null;
    const right = null;
    const top = null;
    const bottom = null;
    return {
      ...node,
      left,
      right,
      top,
      bottom,
      distance: (part2 ? node.value === 0 : node.start) ? 0 : Infinity,
      prev: null,
    };
  });

  graphNodes.forEach((node) => {
    node.left =
      graphNodes.find((n) => n.y === node.y && n.x === node.x - 1) || null;
    node.right =
      graphNodes.find((n) => n.y === node.y && n.x === node.x + 1) || null;
    node.top =
      graphNodes.find((n) => n.y === node.y - 1 && n.x === node.x) || null;
    node.bottom =
      graphNodes.find((n) => n.y === node.y + 1 && n.x === node.x) || null;
  });

  return graphNodes;
}

export function solvePart1(input: string, part2: boolean = false): number {
  const model = parse(input);
  const graph = buildGraph(model, part2);
  const exit = graph.find((node) => node.exit)!;

  const unvisited = [...graph];
  const getMin = (): GraphNode | undefined => {
    return unvisited.sort((a, b) => b.distance - a.distance).pop();
  };

  let current: any;

  while ((current = getMin())) {
    // console.log(current.x, current.y, String.fromCharCode(current.value + 'a'.charCodeAt(0)));
    if (current) {
      [current.left, current.right, current.top, current.bottom]
        .filter((node) => !!node)
        .forEach((node) => {
          const distanceToNode = node.value - current.value > 1 ? Infinity : 1;

          const distanceViaCurrent = current.distance + distanceToNode;
          if (node && node.distance > distanceViaCurrent) {
            node.distance = distanceViaCurrent;
            node.prev = current;
          }
        });
    }
  }

  let print = "";
  for (let i = 0; i < input.split("\n").length; i++) {
    for (let j = 0; j < input.split("\n")[0].split("").length; j++) {
      const node = graph.find((n) => n.y === i && n.x === j);
      if (node && node.distance < Infinity) {
        print += "#";
      } else {
        print += ".";
      }
    }
    print += "\n";
  }

  return exit.distance;
}

export function solvePart2(input: string): number {
  return solvePart1(input, true)
}
