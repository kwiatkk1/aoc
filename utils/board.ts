import Heap from "heap";

export type Direction = "U" | "R" | "D" | "L";

const clockwise = ["U", "R", "D", "L"] as const;

export function turnRight(direction: Direction): Direction {
  const newDirectionIndex =
    (clockwise.indexOf(direction) + 1) % clockwise.length;
  return clockwise[newDirectionIndex];
}

export const directionVectors: Record<Direction, { col: number; row: number }> =
  {
    U: { col: 0, row: -1 },
    R: { col: 1, row: 0 },
    D: { col: 0, row: 1 },
    L: { col: -1, row: 0 },
  };

type BoardNodeLink<T> = {
  node: BoardNode<T>;
  cost: number;
};

export class BoardNode<T> {
  row: number;
  col: number;
  char: string;
  value: T;
  links: Record<Direction, BoardNodeLink<T> | null>;
  predecessors: BoardNode<T>[];
  distance: number;

  constructor(row: number, col: number, char: string, value: T) {
    this.row = row;
    this.col = col;
    this.char = char;
    this.value = value;
    this.links = {
      U: null,
      R: null,
      D: null,
      L: null,
    };
    this.distance = Infinity;
    this.predecessors = [];
  }

  get neighbors(): BoardNode<T>[] {
    return this.neighborLinks.map((it) => it.node);
  }

  get neighborLinks(): BoardNodeLink<T>[] {
    return Object.values(this.links).flatMap((it) => (it ? [it] : []));
  }

  getNeighborsMatching(value: T): BoardNode<T>[] {
    return this.neighbors.filter((it) => it.value === value);
  }
}

export class Board<T> {
  nodesList: BoardNode<T>[];
  nodesLayers: BoardNode<T>[][][];
  width: number;
  height: number;
  validator: (it: BoardNode<T>) => boolean;

  constructor(
    nodes: BoardNode<T>[][],
    opts?: { validator?: (it: BoardNode<T>) => boolean }
  ) {
    this.nodesList = nodes.flat();
    this.nodesLayers = [nodes];
    this.height = nodes.length;
    this.width = nodes[0].length;
    this.validator = opts?.validator || (() => true);
  }

  addLayer(board: Board<T>) {
    this.nodesLayers.push(...board.nodesLayers);
    this.nodesList = [...this.nodesList, ...board.nodesList];
    return this;
  }

  get(row: number, col: number, layer = 0): BoardNode<T> {
    return this.nodesLayers[layer][row]?.[col] || null;
  }

  find(predicate: (node: BoardNode<T>) => boolean) {
    return this.nodesList.find(predicate);
  }

  filter(predicate: (node: BoardNode<T>) => boolean) {
    return this.nodesList.filter(predicate);
  }

  count(predicate: (node: BoardNode<T>) => boolean): number {
    return this.filter(predicate).length;
  }

  print(valueMapper: (it: T) => string, layer = 0) {
    const map = this.nodesLayers[layer]
      .map((row) => row.map((node) => valueMapper(node.value)).join(""))
      .join("\n");

    console.log(map);
  }

  transform<U>(func: (board: Board<T>) => U) {
    return func(this);
  }

  walkFrom(start: BoardNode<T>, valid?: (it: BoardNode<T>) => boolean) {
    const blocksMinQueue = new Heap<BoardNode<T>>(
      (a, b) => a.distance - b.distance
    );

    this.nodesList.forEach((block) => (block.distance = Infinity));
    start.distance = 0;
    start.predecessors = [];
    blocksMinQueue.push(start);

    while (!blocksMinQueue.empty()) {
      const current = blocksMinQueue.pop()!;

      current.neighborLinks
        .filter((link) =>
          valid ? valid(link.node) : this.validator(link.node)
        )
        .forEach(({ node, cost }) => {
          const distanceViaCurrent = current.distance + cost;

          if (node.distance > distanceViaCurrent) {
            node.distance = distanceViaCurrent;
            node.predecessors = [current];
            blocksMinQueue.push(node);
          } else if (node.distance === distanceViaCurrent) {
            node.predecessors.push(current);
          }
        });
    }
  }

  getAllPaths(start: BoardNode<T>, end: BoardNode<T>): BoardNode<T>[][] {
    const paths = [];
    const queue = [{ path: [start] }];

    this.walkFrom(end);

    while (queue.length > 0) {
      const { path } = queue.shift()!;
      const node = path[path.length - 1];

      if (node === end) {
        paths.push(path);
      }

      node.predecessors.forEach((it) => queue.push({ path: [...path, it] }));
    }

    return paths;
  }

  getAllDirections(start: BoardNode<T>, end: BoardNode<T>): Direction[][] {
    const paths = this.getAllPaths(start, end);
    return paths.map((path) => {
      return path.reduce((directions, node, currentIndex): Direction[] => {
        if (currentIndex === 0) return directions;
        const previousNode = path[currentIndex - 1];

        const direction =
          previousNode.links.U?.node === node
            ? "U"
            : previousNode.links.D?.node === node
            ? "D"
            : previousNode.links.L?.node === node
            ? "L"
            : "R";

        return [...directions, direction];
      }, [] as Direction[]);
    });
  }

  static from<T>(
    input: string,
    value: ({
      char,
      row,
      col,
    }: {
      char: string;
      row: number;
      col: number;
    }) => T,
    validator?: (it: BoardNode<T>) => boolean
  ): Board<T> {
    const lines = input.split("\n");
    const height = lines.length;
    const width = lines[0].length;
    const nodes: BoardNode<T>[][] = [];

    for (let row = 0; row < height; row++) {
      nodes[row] = nodes[row] || [];
      for (let col = 0; col < width; col++) {
        const char = lines[row][col];
        nodes[row][col] = new BoardNode(
          row,
          col,
          char,
          value({ char, row, col })
        );
      }
    }

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const node = nodes[row][col];
        Object.entries(directionVectors).forEach(
          ([direction, { col: dx, row: dy }]) => {
            const linkedNode = nodes[row + dy]?.[col + dx];
            node.links[direction as Direction] = linkedNode
              ? { node: linkedNode, cost: 1 }
              : null;
          }
        );
      }
    }

    return new Board(nodes, { validator });
  }
}
