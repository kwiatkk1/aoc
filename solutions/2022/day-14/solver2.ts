import { parseInt } from "lodash";

type Column = {
  col: number;
  y: number;
  d: number;
};
type Row = {
  row: number;
  x: number;
  d: number;
};

type Line = Column | Row;

function parse(input: string) {
  const lines = input.split("\n");

  return lines.flatMap((line) =>
    line
      .split(" -> ")
      .map((txt) => txt.split(",").map((it) => parseInt(it)))
      .flatMap((curr, index, all): Line[] => {
        if (index === 0) return [];
        const prev = all[index - 1];
        if (curr[0] === prev[0]) {
          if (curr[1] < prev[1]) {
            return [{ col: curr[0], y: curr[1], d: prev[1] - curr[1] + 1 }];
          } else {
            return [{ col: curr[0], y: prev[1], d: curr[1] - prev[1] + 1 }];
          }
        }
        if (curr[0] < prev[0]) {
          return [{ row: curr[1], x: curr[0], d: prev[0] - curr[0] + 1 }];
        }
        return [{ row: curr[1], x: prev[0], d: curr[0] - prev[0] + 1 }];
      })
  );
}

class Game {
  minCol: number;
  maxCol: number;
  maxRow: number;
  lines: Line[];
  board: string[][];
  sand: { row: number; col: number } | null;
  exit: boolean;

  constructor({
    minCol,
    maxCol,
    maxRow,
    lines,
  }: {
    minCol: number;
    maxCol: number;
    maxRow: number;
    lines: Line[];
  }) {
    // console.log({
    //   minCol,
    //   maxCol,
    //   maxRow,
    //   lines,
    // });
    const minColExtended = 500 - (maxRow + 3);
    const maxColExtended = 500 + (maxRow + 3);

    this.minCol = minColExtended;
    this.maxCol = maxColExtended;
    this.maxRow = maxRow;
    this.lines = lines;
    this.sand = null;
    this.exit = false;

    const columns = maxColExtended - minColExtended;
    this.board = new Array(maxRow + 1 + 2)
      .fill([])
      .map((_, index, arr) =>
        new Array(columns).fill(index === arr.length - 1 ? "#" : ".")
      );

    this.putRocks();
  }

  putRocks() {
    this.lines.forEach((line) => {
      if ("col" in line) {
        const { col, y, d } = line;
        for (let i = 0; i < d; i++) {
          this.board[y + i][col - this.minCol] = "#";
        }
      }
      if ("row" in line) {
        const { row, x, d } = line;
        for (let i = 0; i < d; i++) {
          this.board[row][x - this.minCol + i] = "#";
        }
      }
    });
  }

  print() {
    const boardWithSand = this.board.map((row, x) =>
      row.map((col, y) => {
        if (this.sand?.row === x && this.sand.col === y) return "x";
        return col;
      })
    );

    return boardWithSand
      .map((row, y) => `${"" && y.toString().padStart(3)}${row.join("")}`)
      .join("\n");
  }

  moveSand(): boolean {
    const { col, row } = this.sand!;
    // out of board
    if (!this.board[row + 1]) {
      this.sand = null;
      this.exit = true;
      return true;
    }
    // regular move
    if (this.board[row + 1][col] === ".") {
      this.sand = { col, row: row + 1 };
      return true;
    }
    // move left
    if (this.board[row + 1][col] === "#" || this.board[row + 1][col] === "o") {
      if (
        this.board[row + 1][col - 1] === "." ||
        !this.board[row + 1][col - 1]
      ) {
        this.sand = !this.board[row + 1][col - 1]
          ? null
          : { col: col - 1, row: row + 1 };
        if (this.sand === null) this.exit = true;
        return true;
      } else if (
        this.board[row + 1][col + 1] === "." ||
        !this.board[row + 1][col + 1]
      ) {
        this.sand = !this.board[row + 1][col + 1]
          ? null
          : { col: col + 1, row: row + 1 };
        if (this.sand === null) this.exit = true;
        return true;
      }
    }

    return false;
  }

  step() {
    if (!this.sand) {
      this.sand = { row: 0, col: 500 - this.minCol };
    } else {
      if (!this.moveSand()) {
        if (this.sand.row === 0 && this.sand.col === 500 - this.minCol) {
          this.exit = true;
        }
        this.board[this.sand.row][this.sand.col] = "o";
        this.sand = null;
      }
    }
  }
}

export function solvePart2(input: string): number {
  const lines = parse(input);
  const minCol = Math.min(...lines.map((it) => ("col" in it ? it.col : it.x)));
  const maxCol = Math.max(
    ...lines.map((it) => ("col" in it ? it.col : it.x + it.d))
  );
  const maxRow = Math.max(
    ...lines.map((it) => ("row" in it ? it.row : it.y + it.d))
  );

  const game = new Game({ minCol, maxCol, maxRow, lines });

  // console.log(game.print());

  let i = 0;
  while (!game.exit) {
    game.step();
    // if (i++ % 20) {
    //   console.log("round", i);
    //   console.log(game.print());
    // }
  }
  // console.log(game.print());
  return game.board.flat().filter((it) => it === "o").length;
}
