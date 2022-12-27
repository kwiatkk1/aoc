class Cmd {
  constructor(public text: string, public value: number = 0) {}

  static fromText(text: string) {
    if (text === "R" || text === "L") return new Cmd(text);
    return new Cmd(text, parseInt(text));
  }
}

type NodeLink = {
  node: Node;
  direction: Direction;
};

class Node {
  L: NodeLink | null = null;
  R: NodeLink | null = null;
  T: NodeLink | null = null;
  B: NodeLink | null = null;

  x: number;
  y: number;
  side: Side | null = null;

  constructor(public row: number, public col: number, public isWall: boolean) {
    this.x = 0;
    this.y = 0;
  }

  get size() {
    return this.side?.size || 0;
  }

  setSide(side: Side) {
    this.side = side;

    if (!side) {
      console.log(this);
    }

    this.x = this.col - side.col;
    this.y = this.row - side.row;
  }

  getNeighbour(direction: Direction, nodes: Node[]): NodeLink {
    const side = this.side!;

    const {
      sideNumber,
      direction: newDirection,
      translate,
    } = side.neighbours[direction];

    const sideNodes = nodes.filter((n) => n.side?.id === sideNumber);
    const coords = translate(this);
    const node = sideNodes.find(
      (node) => node.x === coords.x && node.y === coords.y
    );

    if (!node) {
      console.log(
        { x: this.x, y: this.y, side: side.id },
        { direction, coords, sideNumber }
      );
    }

    return {
      direction: newDirection,
      node: node!,
    };
  }

  link(nodes: Node[]) {
    const { x, y, side } = this;

    const rowNodes = nodes.filter((it) => it.side === side && it.y === y);
    const colNodes = nodes.filter((it) => it.side === side && it.x === x);

    const directL = rowNodes.find((it) => it.x === x - 1);
    const directR = rowNodes.find((it) => it.x === x + 1);
    const directT = colNodes.find((it) => it.y === y - 1);
    const directB = colNodes.find((it) => it.y === y + 1);

    const nextL = directL
      ? { node: directL, direction: "<" as Direction }
      : this.getNeighbour("<", nodes);
    const nextR = directR
      ? { node: directR, direction: ">" as Direction }
      : this.getNeighbour(">", nodes);
    const nextT = directT
      ? { node: directT, direction: "^" as Direction }
      : this.getNeighbour("^", nodes);
    const nextB = directB
      ? { node: directB, direction: "v" as Direction }
      : this.getNeighbour("v", nodes);

    if (nextL && !nextL.node.isWall) this.L = nextL;
    if (nextR && !nextR.node.isWall) this.R = nextR;
    if (nextT && !nextT.node.isWall) this.T = nextT;
    if (nextB && !nextB.node.isWall) this.B = nextB;
  }

  static fromText(text: string, row: number, col: number) {
    const isWall = text === "#";
    return new Node(row, col, isWall);
  }
}

interface Coordinates {
  x: number;
  y: number;
  size: number;
}

class Side {
  col: number;
  row: number;
  constructor(
    public id: number,
    public x: number,
    public y: number,
    public size: number,
    public neighbours: Record<
      Direction,
      {
        sideNumber: number;
        translate: (it: Coordinates) => Coordinates;
        direction: Direction;
      }
    >
  ) {
    this.col = x * size + 1;
    this.row = y * size + 1;
  }

  has(node: Node) {
    const { x, y, size } = this;
    return (
      node.col > x * size &&
      node.col <= x * size + size &&
      node.row > y * size &&
      node.row <= y * size + size
    );
  }
}

type Direction = "<" | ">" | "^" | "v";

class Game {
  currentNode: Node;
  direction: Direction = ">";

  constructor(public nodes: Node[]) {
    this.currentNode = nodes
      .filter((it) => it.row === 1)
      .sort((a, b) => a.col - b.col)[0];
  }

  run(commands: Cmd[]) {
    commands.forEach((cmd) => {
      if (cmd.value) {
        for (let i = 0; i < cmd.value; i++) {
          if (this.direction === ">" && this.currentNode.R) {
            this.direction = this.currentNode.R.direction;
            this.currentNode = this.currentNode.R.node;
          } else if (this.direction === "<" && this.currentNode.L) {
            this.direction = this.currentNode.L.direction;
            this.currentNode = this.currentNode.L.node;
          } else if (this.direction === "^" && this.currentNode.T) {
            this.direction = this.currentNode.T.direction;
            this.currentNode = this.currentNode.T.node;
          } else if (this.direction === "v" && this.currentNode.B) {
            this.direction = this.currentNode.B.direction;
            this.currentNode = this.currentNode.B.node;
          }
        }
      }
      if (cmd.text === "L") {
        if (this.direction === ">") return (this.direction = "^");
        if (this.direction === "<") return (this.direction = "v");
        if (this.direction === "^") return (this.direction = "<");
        if (this.direction === "v") return (this.direction = ">");
      }
      if (cmd.text === "R") {
        if (this.direction === ">") return (this.direction = "v");
        if (this.direction === "<") return (this.direction = "^");
        if (this.direction === "^") return (this.direction = ">");
        if (this.direction === "v") return (this.direction = "<");
      }
    });
  }

  getScore() {
    const { row, col } = this.currentNode;
    const dirScores = { ">": 0, v: 1, "<": 2, "^": 3 };
    return row * 1000 + col * 4 + dirScores[this.direction];
  }
}

function rotate90(it: Coordinates): Coordinates {
  return {
    x: it.size - 1 - it.y,
    y: it.x,
    size: it.size,
  };
}

function rotate180(it: Coordinates): Coordinates {
  return {
    x: it.size - 1 - it.x,
    y: it.size - 1 - it.y,
    size: it.size,
  };
}

function rotate270(it: Coordinates): Coordinates {
  return {
    x: it.y,
    y: it.size - 1 - it.x,
    size: it.size,
  };
}

function mirrorY(it: Coordinates): Coordinates {
  return {
    x: it.x,
    y: it.size - 1 - it.y,
    size: it.size,
  };
}

function mirrorX(it: Coordinates): Coordinates {
  return {
    x: it.size - 1 - it.x,
    y: it.y,
    size: it.size,
  };
}

function parse(
  input: string,
  sides: Side[]
): { nodes: Node[]; commands: Cmd[] } {
  const [boardInput, cmdInput] = input.split("\n\n");

  const rows = boardInput.split("\n");
  const nodes = rows.flatMap((row, y) =>
    row.split("").flatMap((cell, x) => {
      if (cell === "." || cell === "#")
        return [Node.fromText(cell, y + 1, x + 1)];
      return [];
    })
  );

  nodes.forEach((node) => {
    const side = sides.find((side) => side.has(node));
    if (side) {
      node.setSide(side);
    } else {
      console.log(sides);
      console.log(node);
      process.exit(1);
    }
  });

  nodes.forEach((node) => {
    node.link(nodes);
  });

  const commands = cmdInput
    .split("L")
    .join("\nL\n")
    .split("R")
    .join("\nR\n")
    .split("\n")
    .map((it) => Cmd.fromText(it));

  return {
    nodes,
    commands,
  };
}

export function solvePart2Test(input: string): number {
  const size = 4;

  const sides = [
    new Side(1, 2, 0, size, {
      "^": {
        sideNumber: 2,
        translate: (it: Coordinates) => mirrorY(rotate180(it)),
        direction: "v",
      },
      v: {
        sideNumber: 4,
        translate: (it: Coordinates) => mirrorY(it),
        direction: "v",
      },
      "<": {
        sideNumber: 3,
        translate: (it: Coordinates) => mirrorY(rotate270(it)),
        direction: "v",
      },
      ">": {
        sideNumber: 6,
        translate: (it: Coordinates) => mirrorX(rotate180(it)),
        direction: "<",
      },
    }),
    new Side(2, 0, 1, size, {
      "^": {
        sideNumber: 1,
        translate: (it: Coordinates) => mirrorY(rotate180(it)),
        direction: "v",
      },
      v: {
        sideNumber: 5,
        translate: (it: Coordinates) => mirrorY(rotate180(it)),
        direction: "^",
      },
      "<": {
        sideNumber: 6,
        translate: (it: Coordinates) => mirrorY(rotate90(it)),
        direction: "^",
      },
      ">": {
        sideNumber: 3,
        translate: (it: Coordinates) => mirrorX(it),
        direction: ">",
      },
    }),
    new Side(3, 1, 1, size, {
      "^": {
        sideNumber: 1,
        translate: (it: Coordinates) => mirrorX(rotate90(it)),
        direction: ">",
      },
      v: {
        sideNumber: 5,
        translate: (it: Coordinates) => mirrorX(rotate270(it)),
        direction: ">",
      },
      "<": {
        sideNumber: 2,
        translate: (it: Coordinates) => mirrorX(it),
        direction: "<",
      },
      ">": {
        sideNumber: 4,
        translate: (it: Coordinates) => mirrorX(it),
        direction: ">",
      },
    }),
    new Side(4, 2, 1, size, {
      "^": {
        sideNumber: 1,
        translate: (it: Coordinates) => mirrorY(it),
        direction: "^",
      },
      v: {
        sideNumber: 5,
        translate: (it: Coordinates) => mirrorY(it),
        direction: "v",
      },
      "<": {
        sideNumber: 3,
        translate: (it: Coordinates) => mirrorX(it),
        direction: "<",
      },
      ">": {
        sideNumber: 6,
        translate: (it: Coordinates) => mirrorY(rotate90(it)),
        direction: "v",
      },
    }),
    new Side(5, 2, 2, size, {
      "^": {
        sideNumber: 4,
        translate: (it: Coordinates) => mirrorY(it),
        direction: "^",
      },
      v: {
        sideNumber: 2,
        translate: (it: Coordinates) => mirrorY(rotate180(it)),
        direction: "^",
      },
      "<": {
        sideNumber: 3,
        translate: (it: Coordinates) => mirrorY(rotate270(it)),
        direction: "^",
      },
      ">": {
        sideNumber: 6,
        translate: (it: Coordinates) => mirrorX(it),
        direction: ">",
      },
    }),
    new Side(6, 3, 2, size, {
      "^": {
        sideNumber: 4,
        translate: (it: Coordinates) => mirrorX(rotate270(it)),
        direction: "<",
      },
      v: {
        sideNumber: 2,
        translate: (it: Coordinates) => mirrorX(rotate270(it)),
        direction: ">",
      },
      "<": {
        sideNumber: 5,
        translate: (it: Coordinates) => mirrorX(it),
        direction: "<",
      },
      ">": {
        sideNumber: 1,
        translate: (it: Coordinates) => mirrorX(rotate180(it)),
        direction: "<",
      },
    }),
  ];

  const { nodes, commands } = parse(input, sides);
  const game = new Game(nodes);

  game.run(commands);
  return game.getScore();
}

export function solvePart2Real(input: string): number {
  const size = 50;

  const sides = [
    new Side(1, 1, 0, size, {
      "^": {
        sideNumber: 6,
        translate: (it: Coordinates) => mirrorX(rotate90(it)),
        direction: ">",
      },
      v: {
        sideNumber: 3,
        translate: (it: Coordinates) => mirrorY(it),
        direction: "v",
      },
      "<": {
        sideNumber: 4,
        translate: (it: Coordinates) => mirrorX(rotate180(it)),
        direction: ">",
      },
      ">": {
        sideNumber: 2,
        translate: (it: Coordinates) => mirrorX(it),
        direction: ">",
      },
    }),
    new Side(2, 2, 0, size, {
      "^": {
        sideNumber: 6,
        translate: (it: Coordinates) => mirrorY(it),
        direction: "^",
      },
      v: {
        sideNumber: 3,
        translate: (it: Coordinates) => mirrorX(rotate90(it)),
        direction: "<",
      },
      "<": {
        sideNumber: 1,
        translate: (it: Coordinates) => mirrorX(it),
        direction: "<",
      },
      ">": {
        sideNumber: 5,
        translate: (it: Coordinates) => mirrorX(rotate180(it)),
        direction: "<",
      },
    }),
    new Side(3, 1, 1, size, {
      "^": {
        sideNumber: 1,
        translate: (it: Coordinates) => mirrorY(it),
        direction: "^",
      },
      v: {
        sideNumber: 5,
        translate: (it: Coordinates) => mirrorY(it),
        direction: "v",
      },
      "<": {
        sideNumber: 4,
        translate: (it: Coordinates) => mirrorY(rotate270(it)),
        direction: "v",
      },
      ">": {
        sideNumber: 2,
        translate: (it: Coordinates) => mirrorY(rotate270(it)),
        direction: "^",
      },
    }),
    new Side(4, 0, 2, size, {
      "^": {
        sideNumber: 3,
        translate: (it: Coordinates) => mirrorX(rotate90(it)),
        direction: ">",
      },
      v: {
        sideNumber: 6,
        translate: (it: Coordinates) => mirrorY(it),
        direction: "v",
      },
      "<": {
        sideNumber: 1,
        translate: (it: Coordinates) => mirrorX(rotate180(it)),
        direction: ">",
      },
      ">": {
        sideNumber: 5,
        translate: (it: Coordinates) => mirrorX(it),
        direction: ">",
      },
    }),
    new Side(5, 1, 2, size, {
      "^": {
        sideNumber: 3,
        translate: (it: Coordinates) => mirrorY(it),
        direction: "^",
      },
      v: {
        sideNumber: 6,
        translate: (it: Coordinates) => mirrorX(rotate90(it)),
        direction: "<",
      },
      "<": {
        sideNumber: 4,
        translate: (it: Coordinates) => mirrorX(it),
        direction: "<",
      },
      ">": {
        sideNumber: 2,
        translate: (it: Coordinates) => mirrorX(rotate180(it)),
        direction: "<",
      },
    }),
    new Side(6, 0, 3, size, {
      "^": {
        sideNumber: 4,
        translate: (it: Coordinates) => mirrorY(it),
        direction: "^",
      },
      v: {
        sideNumber: 2,
        translate: (it: Coordinates) => mirrorY(it),
        direction: "v",
      },
      "<": {
        sideNumber: 1,
        translate: (it: Coordinates) => mirrorY(rotate270(it)),
        direction: "v",
      },
      ">": {
        sideNumber: 5,
        translate: (it: Coordinates) => mirrorY(rotate270(it)),
        direction: "^",
      },
    }),
  ];

  const { nodes, commands } = parse(input, sides);
  const game = new Game(nodes);

  game.run(commands);
  return game.getScore();
}
