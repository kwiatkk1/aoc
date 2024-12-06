type Node = {
  row: number;
  col: number;
  isVisited: boolean;
  visited: Record<Direction, boolean>;
  isObstacle: boolean;
};

type Direction = "u" | "d" | "l" | "r";

function parse(input: string): Node[] {
  return input.split("\n").flatMap((rowString, row) =>
    rowString.split("").map(
      (value, col): Node => ({
        row,
        col,
        isVisited: value === "^",
        visited: { u: value === "^", d: false, l: false, r: false },
        isObstacle: value === "#",
      })
    )
  );
}

function getNextNode({ row, col }: Node, direction: Direction, data: Node[]) {
  let nextRow = row;
  let nextCol = col;

  switch (direction) {
    case "u":
      nextRow--;
      break;
    case "d":
      nextRow++;
      break;
    case "l":
      nextCol--;
      break;
    case "r":
      nextCol++;
      break;
  }

  return data.find((node) => node.row === nextRow && node.col === nextCol);
}

function walk(data: Node[]) {
  let current = data.find((node) => node.isVisited)!;
  let direction: Direction = "u";
  let next = getNextNode(current, direction, data);

  while (next) {
    if (next.isObstacle) {
      switch (direction) {
        case "u":
          direction = "r";
          break;
        case "r":
          direction = "d";
          break;
        case "d":
          direction = "l";
          break;
        case "l":
          direction = "u";
          break;
      }
      next = getNextNode(current, direction, data);
      continue;
    }

    const tmp = next;
    next.isVisited = true;
    next = getNextNode(next, direction, data);
    current = tmp;
  }

  return data;
}

function isLoop(data: Node[]): boolean {
  const start = data.find((node) => node.isVisited);

  if (!start) return false;

  let current = start;
  let direction: Direction = "u";
  let next = getNextNode(current, direction, data);

  while (next) {
    if (next.isObstacle) {
      switch (direction) {
        case "u":
          direction = "r";
          break;
        case "r":
          direction = "d";
          break;
        case "d":
          direction = "l";
          break;
        case "l":
          direction = "u";
          break;
      }
      next = getNextNode(current, direction, data);
      continue;
    }

    const tmp = next;

    if (next.visited[direction]) {
      return true;
    }

    next.isVisited = true;
    next.visited[direction] = true;

    next = getNextNode(next, direction, data);
    current = tmp;
  }

  return false;
}

export function solvePart1(input: string): number {
  const map = parse(input);
  return walk(map).filter((node) => node.isVisited).length;
}

export function solvePart2(input: string): number {
  const map = parse(input);
  const start = map.find((node) => node.isVisited)!;
  const toCheck = walk(map)
    .filter((it) => it.isVisited)
    .filter((it) => it !== start);

  return toCheck.reduce((loopCount, { row, col }) => {
    const newMap = parse(input);
    const newObstacle = newMap.find((it) => row === it.row && col === it.col);

    newObstacle!.isObstacle = true;

    return loopCount + (isLoop(newMap) ? 1 : 0);
  }, 0);
}
