import { Board, BoardNode } from "../../../utils/board";

function parse(input: string) {
  return Board.from(input, ({ char }) => char === "@");
}

function getNodesToRemove(board: Board<boolean>): BoardNode<boolean>[] {
  return board
    .filter((it) => it.value)
    .filter((it) => {
      const adjacentPapers =
        it.getNeighborsMatching(true).length +
        [
          board.get(it.row - 1, it.col - 1),
          board.get(it.row + 1, it.col - 1),
          board.get(it.row - 1, it.col + 1),
          board.get(it.row + 1, it.col + 1),
        ].filter((it) => it?.value).length;
      return adjacentPapers < 4;
    });
}

export function solvePart1(input: string): number {
  const board = parse(input);
  return getNodesToRemove(board).length;
}

export function solvePart2(input: string): number {
  const board = parse(input);
  let toRemove = getNodesToRemove(board);
  let count = 0;

  while (toRemove.length > 0) {
    count += toRemove.length;
    toRemove.forEach((it) => (it.value = false));
    toRemove = getNodesToRemove(board);
  }

  return count;
}
