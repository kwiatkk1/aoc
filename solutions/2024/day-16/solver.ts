import { Board, BoardNode } from "../../../utils/board";

type MazeTile = {
  isWall: boolean;
  isPath: boolean;
  isStart: boolean;
  isEnd: boolean;
  distance: number;
  predecessors: BoardNode<MazeTile>[];
  neighbours: Array<{ cost: number; block: BoardNode<MazeTile> }>;
};

class Queue {
  private queue: BoardNode<MazeTile>[] = [];

  constructor(queue: BoardNode<MazeTile>[] = []) {
    this.queue = queue;
  }

  upsert(block: BoardNode<MazeTile>) {
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

  dequeue(): BoardNode<MazeTile> {
    const min = this.queue.shift();
    if (!min) throw new Error("Queue is empty");
    return min;
  }

  size() {
    return this.queue.length;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

function parse(input: string) {
  const getBoard = () =>
    Board.from<MazeTile>(input, ({ char }) => ({
      isWall: char === "#",
      isPath: char !== "#",
      isStart: char === "S",
      isEnd: char === "E",
      distance: Infinity,
      predecessors: [],
      neighbours: [],
    }));

  const boardH = getBoard();
  const boardV = getBoard();

  // horizontal links cheap, vertical links expensive
  boardH.nodesList
    .filter((it) => !it.value.isWall)
    .forEach((node) => {
      node.value.neighbours = [
        { cost: 1, block: node.links.L! },
        { cost: 1, block: node.links.R! },
        { cost: 1001, block: boardV.get(node.links.U!.row, node.links.U!.col) },
        { cost: 1001, block: boardV.get(node.links.D!.row, node.links.D!.col) },
      ];
    });

  // vertical links cheap, horizontal links expensive
  boardV.nodesList
    .filter((it) => !it.value.isWall)
    .forEach((node) => {
      node.value.neighbours = [
        { cost: 1, block: node.links.U! },
        { cost: 1, block: node.links.D! },
        { cost: 1001, block: boardH.get(node.links.L!.row, node.links.L!.col) },
        { cost: 1001, block: boardH.get(node.links.R!.row, node.links.R!.col) },
      ];
    });

  // single graph that has cost of changing direction included in the cost
  // you can think of it as a graph that has two levels, one for horizontal and one for vertical and the cost of changing layers is 1000
  const graph = [...boardH.nodesList, ...boardV.nodesList];
  const start = boardH.nodesList.find(({ value }) => value.isStart)!;

  return { graph, start };
}

function walk(blocks: BoardNode<MazeTile>[], start: BoardNode<MazeTile>) {
  const blocksMinQueue = new Queue(blocks);

  blocks.forEach((block) => (block.value.distance = Infinity));
  start.value.distance = 0;
  start.value.predecessors = [];
  blocksMinQueue.upsert(start);

  while (!blocksMinQueue.isEmpty()) {
    const current = blocksMinQueue.dequeue();

    current.value.neighbours.forEach(({ cost, block }) => {
      const distanceViaCurrent = current.value.distance + cost;

      if (block.value.distance > distanceViaCurrent) {
        block.value.distance = distanceViaCurrent;
        block.value.predecessors = [current];
        blocksMinQueue.upsert(block);
      } else if (block.value.distance === distanceViaCurrent) {
        block.value.predecessors.push(current);
      }
    });
  }
}

function getAllTrailsBack(start: BoardNode<MazeTile>): BoardNode<MazeTile>[][] {
  const paths = [];
  const queue = [{ path: [start] }];

  while (queue.length > 0) {
    const { path } = queue.shift()!;
    const node = path[path.length - 1];

    if (node.value.isStart) {
      paths.push(path);
    }

    node.value.predecessors.forEach((it) =>
      queue.push({ path: [...path, it] })
    );
  }

  return paths;
}

function dijkstraSolve(input: string) {
  const { graph, start } = parse(input);
  const ends = graph.filter(({ value }) => value.isEnd);
  walk(graph, start);
  return {
    graph,
    end: ends.sort((a, b) => a.value.distance - b.value.distance)[0],
  };
}

export function solvePart1(input: string): number {
  const { end } = dijkstraSolve(input);
  return end.value.distance;
}

export function solvePart2(input: string): number {
  const { end } = dijkstraSolve(input);
  const paths = getAllTrailsBack(end);
  const visitedPoints = paths
    .flat()
    .map((node) => `${node.row}x${node.col}`)
    .reduce((acc, it) => acc.add(it), new Set<string>());

  return visitedPoints.size;
}
