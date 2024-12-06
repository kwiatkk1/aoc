export type Direction = "U" | "R" | "D" | "L";

const clockwise = ["U", "R", "D", "L"] as const;
export function turnRight(direction: Direction): Direction {
  const newDirectionIndex =
    (clockwise.indexOf(direction) + 1) % clockwise.length;
  return clockwise[newDirectionIndex];
}

export class BoardNode<T> {
  row: number;
  col: number;
  char: string;
  value: T;
  links: Record<Direction, BoardNode<T> | null>;

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
  }
}

export class Board<T> {
  nodesList: BoardNode<T>[];
  nodes: BoardNode<T>[][];
  width: number;
  height: number;

  constructor(nodes: BoardNode<T>[][]) {
    this.nodesList = nodes.flat();
    this.nodes = nodes;
    this.height = nodes.length;
    this.width = nodes[0].length;
  }

  get(row: number, col: number) {
    return this.nodes[row]?.[col] || null;
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

  print(valueMapper: (it: T) => string) {
    const map = this.nodes
      .map((row) => row.map((node) => valueMapper(node.value)).join(""))
      .join("\n");

    console.log(map);
  }

  static from<T>(
    input: string,
    value: ({ char, row, col }: { char: string; row: number; col: number }) => T
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
        node.links.U = nodes[row - 1]?.[col] || null;
        node.links.D = nodes[row + 1]?.[col] || null;
        node.links.L = nodes[row][col - 1] || null;
        node.links.R = nodes[row][col + 1] || null;
      }
    }

    return new Board(nodes);
  }
}
