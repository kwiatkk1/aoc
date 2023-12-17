type Block = {
  row: number;
  col: number;
  heat: number;
  neighbours: Array<{ cost: number; block: Block }>;
  distance: number;
};

class BlocksQueue {
  private queue: Block[] = [];

  constructor(queue: Block[] = []) {
    this.queue = queue;
  }

  upsert(block: Block) {
    const { queue } = this;
    const currentIndex = queue.indexOf(block);

    if (currentIndex !== -1) queue.splice(currentIndex, 1);

    const insertAt = queue.findIndex((it) => it.distance > block.distance);

    if (insertAt === -1) {
      queue.push(block);
    } else {
      queue.splice(insertAt, 0, block);
    }
  }

  dequeue(): Block {
    const min = this.queue.shift();
    if (!min) throw new Error("Queue is empty");
    return min;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

function parse(input: string, delta: { min: number; max: number }) {
  const blocksH = input.split("\n").map((line, row) =>
    line.split("").map<Block>((char, col) => ({
      row,
      col,
      heat: parseInt(char),
      neighbours: [],
      distance: Infinity,
    }))
  );
  const blocksV = input.split("\n").map((line, row) =>
    line.split("").map<Block>((char, col) => ({
      row,
      col,
      heat: parseInt(char),
      neighbours: [],
      distance: Infinity,
    }))
  );

  blocksH.flat().forEach((block, i) => {
    const { row, col } = block;

    // add neighbours left/right
    const cost = { left: 0, right: 0 };
    for (let dx = 1; dx <= delta.max; dx++) {
      if (col - dx >= 0) {
        const target = blocksV[row][col - dx];
        cost.left += target.heat;

        if (dx >= delta.min)
          block.neighbours.push({
            cost: cost.left,
            block: target,
          });
      }

      if (col + dx < blocksH.length) {
        const target = blocksV[row][col + dx];
        cost.right += target.heat;

        if (dx >= delta.min)
          block.neighbours.push({
            cost: cost.right,
            block: target,
          });
      }
    }
  });

  blocksV.flat().forEach((block, i) => {
    const { row, col } = block;

    // add neighbours up/down
    const cost = { up: 0, down: 0 };
    for (let dy = 1; dy <= delta.max; dy++) {
      if (row - dy >= 0) {
        const target = blocksH[row - dy][col];
        cost.up += target.heat;

        if (dy >= delta.min)
          block.neighbours.push({
            cost: cost.up,
            block: target,
          });
      }

      if (row + dy < blocksH.length) {
        const target = blocksH[row + dy][col];
        cost.down += target.heat;

        if (dy >= delta.min)
          block.neighbours.push({
            cost: cost.down,
            block: target,
          });
      }
    }
  });

  return {
    blocks: [...blocksH, ...blocksV].flat(),
    maxRow: blocksH.length - 1,
    maxCol: blocksH[0].length - 1,
  };
}

function walk(blocks: Block[], start: Block) {
  const blocksMinQueue = new BlocksQueue(blocks);

  blocks.forEach((block) => (block.distance = Infinity));
  start.distance = 0;
  blocksMinQueue.upsert(start);

  while (!blocksMinQueue.isEmpty()) {
    const current = blocksMinQueue.dequeue();

    current.neighbours.forEach(({ cost, block }) => {
      const distanceViaCurrent = current.distance + cost;

      if (block.distance > distanceViaCurrent) {
        block.distance = distanceViaCurrent;
        blocksMinQueue.upsert(block);
      }
    });
  }
}

function solve(input: string, delta: { min: number; max: number }) {
  const { blocks, maxRow, maxCol } = parse(input, delta);

  // we can go either vertical or horizontal from the start
  const starts = blocks.filter(({ row, col }) => row === 0 && col === 0);

  // we can end coming from any direction
  const end = blocks.filter(({ row, col }) => row === maxRow && col === maxCol);

  return starts.reduce((min, start) => {
    walk(blocks, start);
    return Math.min(min, ...end.map((it) => it.distance));
  }, Infinity);
}

export function solvePart1(input: string): number {
  return solve(input, { min: 1, max: 3 });
}
export function solvePart2(input: string): number {
  return solve(input, { min: 4, max: 10 });
}
