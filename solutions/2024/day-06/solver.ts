import { Board, BoardNode, Direction, turnRight } from "../../../utils/board";
import { progressLogger } from "../../../utils/debug";

type Square = {
  isGuardsStart: boolean;
  isObstruction: boolean;
  visited: Direction[];
};

const unique = <T>(array: T[]): T[] => [...new Set(array)];
const sum = (acc: number, value: number) => acc + value;

function walk(data: Board<Square>): {
  path: BoardNode<Square>[];
  isLoop: boolean;
} {
  let current = data.find(({ value }) => value.isGuardsStart)!;
  let path: BoardNode<Square>[] = [current];
  let direction: Direction = "U";
  let next = current.links[direction];

  while (next) {
    // we have a loop
    if (next.value.visited.includes(direction)) {
      return { path, isLoop: true };
    }

    // we hit a wall
    if (next.value.isObstruction) {
      direction = turnRight(direction);
      next = current.links[direction];
      continue;
    }

    next.value.visited.push(direction);
    path.push(next);

    [current, next] = [next, next.links[direction]];
  }

  return { path, isLoop: false };
}

function parse(input: string) {
  return Board.from(
    input,
    ({ char }): Square => ({
      isGuardsStart: char === "^",
      isObstruction: char === "#",
      visited: char === "^" ? ["U"] : [],
    })
  );
}

export function solvePart1(input: string): number {
  const board = parse(input);
  const { path } = walk(board);
  const visited = unique(path);

  return visited.length;
}

export function solvePart2(input: string): number {
  const board = parse(input);
  const { path } = walk(board);
  const visited = unique(path);

  return visited
    .filter(({ value }) => !value.isGuardsStart)
    .map(({ row, col }, i, all): number => {
      const cleanBoard = parse(input);
      const obstruction = cleanBoard.get(row, col);
      obstruction.value.isObstruction = true;
      progressLogger.print(`removing obstruction ${i + 1}/${all.length}`);
      return walk(cleanBoard).isLoop ? 1 : 0;
    })
    .reduce(sum);
}
