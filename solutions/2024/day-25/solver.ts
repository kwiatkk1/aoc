import { Board } from "../../../utils/board";
import { groupBy } from "lodash";

type Schema = {
  type: "lock" | "key";
  heights: number[];
  max: number;
};

function parse(input: string) {
  const schematicsInputs = input.split("\n\n");
  const boards = schematicsInputs.map((schematic) =>
    Board.from(schematic, ({ char }) => char === "#")
  );

  return groupBy(
    boards.map((board): Schema => {
      const { width, height } = board;
      const heights = [];

      const isLock =
        board.filter((cell) => cell.row === 0 && cell.value).length === width;

      for (let i = 0; i < width; i++) {
        const heightFill =
          board.filter((cell) => cell.col === i && cell.value).length - 1;

        heights.push(heightFill);
      }

      return { type: isLock ? "lock" : "key", heights, max: height };
    }),
    "type"
  );
}

function haveOverlap(lock: Schema, key: Schema) {
  for (let i = 0; i < lock.heights.length; i++) {
    if (lock.heights[i] + key.heights[i] > lock.max - 2) return true;
  }
  return false;
}

export function solvePart1(input: string): number {
  const groupsBy = parse(input);

  return groupsBy.lock
    .flatMap((lock) => groupsBy.key.map((key) => ({ lock, key })))
    .filter(({ lock, key }) => !haveOverlap(lock, key)).length;
}
