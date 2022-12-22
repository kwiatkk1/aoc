class Cmd {
  constructor(public text: string, public value: number = 0) {}

  static fromText(text: string) {
    if (text === "R" || text === "L") return new Cmd(text);
    return new Cmd(text, parseInt(text));
  }
}

class Node {
  L: Node | null = null;
  R: Node | null = null;
  T: Node | null = null;
  B: Node | null = null;

  constructor(public row: number, public col: number, public isWall: boolean) {}

  link(nodes: Node[]) {
    const { row, col } = this;

    const rowNodes = nodes.filter((it) => it.row === row);
    const colNodes = nodes.filter((it) => it.col === col);

    const minRow = Math.min(...colNodes.map((it) => it.row));
    const maxRow = Math.max(...colNodes.map((it) => it.row));
    const minCol = Math.min(...rowNodes.map((it) => it.col));
    const maxCol = Math.max(...rowNodes.map((it) => it.col));

    const directL = rowNodes.find((it) => it.col === col - 1);
    const directR = rowNodes.find((it) => it.col === col + 1);
    const directT = colNodes.find((it) => it.row === row - 1);
    const directB = colNodes.find((it) => it.row === row + 1);

    const oppositeL = rowNodes.find((it) => it.col === maxCol);
    const oppositeR = rowNodes.find((it) => it.col === minCol);
    const oppositeT = colNodes.find((it) => it.row === maxRow);
    const oppositeB = colNodes.find((it) => it.row === minRow);

    const nextL = directL || oppositeL;
    const nextR = directR || oppositeR;
    const nextT = directT || oppositeT;
    const nextB = directB || oppositeB;

    if (nextL && !nextL.isWall) this.L = nextL;
    if (nextR && !nextR.isWall) this.R = nextR;
    if (nextT && !nextT.isWall) this.T = nextT;
    if (nextB && !nextB.isWall) this.B = nextB;
  }

  static fromText(text: string, row: number, col: number) {
    const isWall = text === "#";
    return new Node(row, col, isWall);
  }
}

class Game {
  currentNode: Node;
  direction: "<" | ">" | "^" | "v" = ">";

  constructor(public nodes: Node[]) {
    this.currentNode = nodes
      .filter((it) => it.row === 1)
      .sort((a, b) => a.col - b.col)[0];
  }

  run(commands: Cmd[]) {
    commands.forEach((cmd) => {
      if (cmd.value) {
        for (let i = 0; i < cmd.value; i++) {
          if (this.direction === ">" && this.currentNode.R)
            this.currentNode = this.currentNode.R;
          if (this.direction === "<" && this.currentNode.L)
            this.currentNode = this.currentNode.L;
          if (this.direction === "^" && this.currentNode.T)
            this.currentNode = this.currentNode.T;
          if (this.direction === "v" && this.currentNode.B)
            this.currentNode = this.currentNode.B;
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

function print(nodes: Node[]) {
    const maxRow = Math.max(...nodes.map(n => n.row));
    const maxCol = Math.max(...nodes.map(n => n.col));
    let print = '';

    for (let r = 1; r <= maxRow; r++) {
        for (let c = 1; c <= maxCol; c++) {
            const node = nodes.find(n => n.row === r && n.col === c);
            if (!node) print += ' ';
            else if (node.isWall) print += '#';
            else print += '.';
        }
        print += '\n';
    }

    return print;
}

function parse(input: string): { nodes: Node[]; commands: Cmd[] } {
  const [boardInput, cmdInput] = input.split("\n\n");

  const rows = boardInput.split("\n");
  const nodes = rows.flatMap((row, y) =>
    row.split("").flatMap((cell, x) => {
      if (cell === "." || cell === "#")
        return [Node.fromText(cell, y + 1, x + 1)];
      return [];
    })
  );

  nodes.forEach((node) => node.link(nodes));

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

export function solvePart1(input: string): number {
  const { nodes, commands } = parse(input);
  const game = new Game(nodes);

  // console.log(print(nodes))

    // console.log(game.currentNode);

  game.run(commands);

  return game.getScore();
}
// 141006 too high


export function solvePart2(input: string): number {
  const model = parse(input);
  return -1;
}
