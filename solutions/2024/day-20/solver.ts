import { Board, BoardNode, Direction } from "../../../utils/board";

type Cell = {
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  distance: number;
  predecessors: BoardNode<Cell>[];
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
  start.value.predecessors = [];
  blocksMinQueue.upsert(start);

  while (!blocksMinQueue.isEmpty()) {
    const current = blocksMinQueue.dequeue();

    current.neighbors
      .filter((it) => !it.value.isWall)
      .forEach((it) => {
        const distanceViaCurrent = current.value.distance + 1;

        if (it.value.distance > distanceViaCurrent) {
          it.value.distance = distanceViaCurrent;
          it.value.predecessors = [current];
          blocksMinQueue.upsert(it);
        }
      });
  }
}

function parse(input: string) {
  const board = Board.from(
    input,
    ({ char }): Cell => ({
      isWall: char === "#",
      isStart: char === "S",
      isEnd: char === "E",
      distance: Infinity,
      predecessors: [],
    })
  );

  const start = board.find((it) => it.value.isStart)!;
  const end = board.find((it) => it.value.isEnd)!;
  const isExample = board.width < 100;

  walk(board.nodesList, start);

  const path = [...end.value.predecessors];

  while (!path[0].value.isStart) path.unshift(path[0].value.predecessors[0]);

  return { board, path, isExample };
}

function solve(input: string, maxRadius: number): number {
  const { board, path } = parse(input);

  const cheats = path.flatMap((it): { gain: number }[] => {
    const radiuses = Array.from({ length: maxRadius - 1 }, (_, i) => i + 2);

    return radiuses.flatMap((jumpLength) => {
      const normal = it.value.distance + jumpLength;

      const targets = board.filter(
        ({ row, col, value: { distance } }) =>
          Math.abs(row - it.row) + Math.abs(col - it.col) === jumpLength &&
          distance - normal > 0
      );

      return targets.flatMap((dst) => {
        if (dst && isFinite(dst.value.distance)) {
          return [{ gain: dst.value.distance - normal }];
        } else {
          return [];
        }
      });
    });
  });

  return cheats.filter((it) => it.gain >= 100).length;
}

export function solvePart1(input: string): number {
  return solve(input, 2);
}

export function solvePart2(input: string, maxRadius = 20): number {
  return solve(input, 20);
}
