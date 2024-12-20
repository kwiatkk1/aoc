import { Board } from "../../../utils/board";
import { progressLogger } from "../../../utils/debug";

type Bit = { x: number; y: number };
type Cell = {
  isCorrupted: boolean;
  isStart: boolean;
  isEnd: boolean;
};

function parse(input: string) {
  const bytes: Bit[] = input.split("\n").map((line) => {
    const [x, y] = line.split(",").map((it) => parseInt(it, 10));
    return { x, y };
  });

  const isExample = bytes.length < 100;
  const size = isExample ? 7 : 71;

  const memory = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ".").join("")
  ).join("\n");

  const board = Board.from(
    memory,
    ({ row, col }): Cell => ({
      isCorrupted: false,
      isStart: row === 0 && col === 0,
      isEnd: row === size - 1 && col === size - 1,
    })
  );

  const start = board.find((it) => it.value.isStart)!;
  const end = board.find((it) => it.value.isEnd)!;

  return { board, bytes, isExample, start, end };
}

export function solvePart1(input: string): number {
  const { board, bytes, isExample, start, end } = parse(input);
  const stop = isExample ? 12 : 1024;

  for (let i = 0; i < stop; i++) {
    const byte = bytes[i];
    board.get(byte.y, byte.x).value.isCorrupted = true;
  }

  board.walkFrom(start, (it) => !it.value.isCorrupted);

  return end.distance;
}

export function solvePart2(input: string): string {
  const { board, bytes, start, end } = parse(input);

  let found = null;

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    board.get(byte.y, byte.x).value.isCorrupted = true;

    progressLogger.print(`Processing ${i + 1}/${bytes.length}`);

    board.walkFrom(start, (it) => !it.value.isCorrupted);

    if (end.distance === Infinity) {
      found = byte;
      break;
    }
  }

  return found ? `${found.x},${found.y}` : "x,y";
}
