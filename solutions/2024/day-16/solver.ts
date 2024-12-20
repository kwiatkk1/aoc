import { Board, BoardNode } from "../../../utils/board";

type MazeTile = {
  isWall: boolean;
  isPath: boolean;
  isStart: boolean;
  isEnd: boolean;
};

function parse(input: string) {
  const getBoard = () =>
    Board.from<MazeTile>(input, ({ char }) => ({
      isWall: char === "#",
      isPath: char !== "#",
      isStart: char === "S",
      isEnd: char === "E",
    }));

  const boardH = getBoard();
  const boardV = getBoard();

  boardH.nodesList.forEach((node) => {
    // leave horizontal links as they are, but modify vertical links to point to the other board
    node.links.U = node.links.U && {
      node: boardV.get(node.links.U.node.row, node.links.U.node.col),
      cost: 1001,
    };
    node.links.D = node.links.D && {
      node: boardV.get(node.links.D.node.row, node.links.D.node.col),
      cost: 1001,
    };
  });

  boardV.nodesList.forEach((node) => {
    // leave vertical links as they are, but modify horizontal links to point to the other board
    node.links.L = node.links.L && {
      node: boardH.get(node.links.L.node.row, node.links.L.node.col),
      cost: 1001,
    };
    node.links.R = node.links.R && {
      node: boardH.get(node.links.R.node.row, node.links.R.node.col),
      cost: 1001,
    };
  });

  const start = boardH.nodesList.find(({ value }) => value.isStart)!;

  // single graph that has cost of changing direction included in the cost
  const board = boardH.addLayer(boardV);

  return { board, start };
}

function getTrailsToStart(from: BoardNode<MazeTile>): BoardNode<MazeTile>[][] {
  const paths = [];
  const queue = [{ path: [from] }];

  while (queue.length > 0) {
    const { path } = queue.shift()!;
    const node = path[path.length - 1];

    if (node.value.isStart) {
      paths.push(path);
    }

    node.predecessors.forEach((it) => queue.push({ path: [...path, it] }));
  }

  return paths;
}

function solve(input: string) {
  const { board, start } = parse(input);
  const ends = board.filter(({ value }) => value.isEnd);

  board.walkFrom(start, (it) => !it.value.isWall);

  return ends.sort((a, b) => a.distance - b.distance)[0];
}

export function solvePart1(input: string): number {
  const { distance } = solve(input);
  return distance;
}

export function solvePart2(input: string): number {
  const end = solve(input);

  const paths = getTrailsToStart(end);
  const visitedPoints = paths
    .flat()
    .map((node) => `${node.row}x${node.col}`)
    .reduce((acc, it) => acc.add(it), new Set<string>());

  return visitedPoints.size;
}
