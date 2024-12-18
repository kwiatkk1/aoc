import { Board, BoardNode } from "../../../utils/board";
import { progressLogger } from "../../../utils/debug";

type Bit = { x: number; y: number };
type Cell = {
  isCorrupted: boolean;
  isStart: boolean;
  isEnd: boolean;
  distance: number;
};

class Queue {
  private queue: BoardNode<Cell>[] = [];

  constructor(queue: BoardNode<Cell>[] = []) {
    this.queue = [...queue];
  }

  upsert(block: BoardNode<Cell>) {
    const { queue } = this;
    const currentIndex = queue.indexOf(block);

    if (currentIndex !== -1) queue.splice(currentIndex, 1);

    const insertAt = queue.findIndex(
      (it) => it.value.distance > block.value.distance
    );

    if (insertAt === -1) {
      queue.push(block);
    } else {
      queue.splice(insertAt, 0, block);
    }
  }

  dequeue(): BoardNode<Cell> {
    const min = this.queue.shift();
    if (!min) throw new Error("Queue is empty");
    return min;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

function walk(blocks: BoardNode<Cell>[], start: BoardNode<Cell>) {
  const blocksMinQueue = new Queue(blocks);

  blocks.forEach((block) => (block.value.distance = Infinity));
  start.value.distance = 0;
  blocksMinQueue.upsert(start);

  while (!blocksMinQueue.isEmpty()) {
    const current = blocksMinQueue.dequeue();

    current.neighbors
      .filter((it) => !it.value.isCorrupted)
      .forEach((it) => {
        const distanceViaCurrent = current.value.distance + 1;

        if (it.value.distance > distanceViaCurrent) {
          it.value.distance = distanceViaCurrent;
          blocksMinQueue.upsert(it);
        }
      });
  }
}

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
      distance: Infinity,
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

  walk(board.nodesList, start);

  return end.value.distance;
}

export function solvePart2(input: string): string {
  const { board, bytes, start, end } = parse(input);

  let found = null;

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    board.get(byte.y, byte.x).value.isCorrupted = true;

    progressLogger.print(`Processing ${i + 1}/${bytes.length}`);

    walk(board.nodesList, start);

    if (end.value.distance === Infinity) {
      found = byte;
      break;
    }
  }

  return found ? `${found.x},${found.y}` : "x,y";
}
