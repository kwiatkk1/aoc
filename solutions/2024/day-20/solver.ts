import { Board } from "../../../utils/board";
import { progressLogger } from "../../../utils/debug";

type Cell = {
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
};

function parse(input: string) {
  const board = Board.from(
    input,
    ({ char }): Cell => ({
      isWall: char === "#",
      isStart: char === "S",
      isEnd: char === "E",
    })
  );

  const start = board.find((it) => it.value.isStart)!;
  const end = board.find((it) => it.value.isEnd)!;
  const isExample = board.width < 100;

  board.walkFrom(start, (it) => !it.value.isWall);

  const path = [...end.predecessors];
  while (!path[0].value.isStart) path.unshift(path[0].predecessors[0]);

  return { board, path, isExample };
}

function solve(input: string, maxRadius: number): number {
  const { board, path } = parse(input);
  const progress = progressLogger.countTo((maxRadius - 1) * path.length);

  const cheatGains = path.flatMap((pathNode) => {
    const { row, col, distance } = pathNode;
    const jumpLengths = Array.from({ length: maxRadius - 1 }, (_, i) => i + 2);

    return jumpLengths.flatMap((jmp) => {
      const normal = distance + jmp;

      progress.increment();

      return board
        .filter((it) => Math.abs(row - it.row) + Math.abs(col - it.col) === jmp)
        .flatMap((it) => (isFinite(it.distance) ? [it.distance - normal] : []));
    });
  });

  return cheatGains.filter((gain) => gain >= 100).length;
}

export const solvePart1 = (input: string) => solve(input, 2);
export const solvePart2 = (input: string) => solve(input, 20);
