type Node = {
  row: number;
  col: number;
  type: string;
  neighbors: Node[];
  activated: boolean;
  odd: boolean;
};

function parse(input: string): Node[] {
  const nodes = input.split("\n").map((line, row) =>
    line.split("").map<Node>((char, col) => ({
      row,
      col,
      type: char,
      neighbors: [],
      activated: false,
      odd: false,
    }))
  );

  // link nodes
  nodes.flat().forEach((node) => {
    const { row, col } = node;
    const neighbors: Node[] = [];
    neighbors.push(nodes[row - 1]?.[col]);
    neighbors.push(nodes[row + 1]?.[col]);
    neighbors.push(nodes[row]?.[col - 1]);
    neighbors.push(nodes[row]?.[col + 1]);

    node.neighbors = neighbors.filter((n) => n && n.type !== "#");
  });

  return nodes.flat().filter((n) => n.type !== "#");
}

export function solvePart1(input: string): number {
  const nodes = parse(input);
  let round = 0;
  let maxRound = nodes.length < 1e4 ? 6 : 64;

  const start = nodes.find((node) => node.type === "S")!;
  start.activated = true;
  start.odd = true;

  while (round++ < maxRound) {
    const previouslyVisited = nodes.filter((n) => n.activated);

    previouslyVisited.forEach((node) => {
      node.neighbors
        .filter((n) => n.type !== "#" && !n.activated)
        .forEach((n) => {
          n.activated = true;
          n.odd = !node.odd;
        });
    });
  }

  const isRoundOdd = round % 2 === 1;

  return nodes.filter((n) => n.activated && (isRoundOdd ? n.odd : !n.odd))
    .length;
}
export function solvePart2(input: string): number {
  const nodes = parse(input);
  let round = 0;
  const maxRound = 26501365;

  return 1;
}
