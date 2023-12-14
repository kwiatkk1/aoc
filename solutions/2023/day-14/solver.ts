type Board = Rock[][];

type Rock = {
  x: number;
  y: number;
  type: "O" | "#" | ".";
};

function parse(input: string): Board {
  return input.split("\n").map((line, y) => {
    return line.split("").map((type, x) => {
      return { x, y, type: type as Rock["type"] };
    });
  });
}

function stringify(board: Board): string {
  return board
    .map((row) => {
      return row.map((rock) => rock.type).join("");
    })
    .join("\n");
}

function print(board: Board) {
  console.log(stringify(board));
}

function rotateRight(board: Board): Board {
  const newBoard: Board = [];

  for (let x = 0; x < board[0].length; x++) {
    newBoard.push([]);
    for (let y = board.length - 1; y >= 0; y--) {
      const rock = board[y][x];
      rock.x = y;
      rock.y = x;
      newBoard[x].push(board[y][x]);
    }
  }

  return newBoard;
}

function tilt(board: Board) {
  const slots = board[0].map((rock, x) =>
    rock.type === "." ? (0 as number) : null
  );

  for (let y = 0; y < board.length; y++) {
    const row = board[y];

    for (let x = 0; x < row.length; x++) {
      const rock = row[x];
      let slot = slots[x];

      if (rock.type === "O") {
        if (slot !== null && slot < y) {
          rock.y = slot;
          slots[x] = slot + 1;
          board[slot][x] = rock;
          board[y][x] = { x, y, type: "." };
        } else {
          slots[x] = y + 1;
        }
      } else if (rock.type === "#") {
        slots[x] = y + 1;
      }
    }
  }
}

function cycle(board: Board) {
  for (let i = 0; i < 4; i++) {
    tilt(board);
    board = rotateRight(board);
  }
  return board;
}

function getBoardHash(board: Board): string {
  return board
    .flat()
    .filter((rock) => rock.type === "O")
    .map((rock) => rock.x + "|" + rock.y)
    .join(",");
}

function getScore(board: Board): number {
  return board
    .flat()
    .filter((rock) => rock.type === "O")
    .reduce((total, rock) => {
      return total + (board.length - rock.y);
    }, 0);
}

export function solvePart1(input: string): number {
  const board = parse(input);
  tilt(board);
  return getScore(board);
}
export function solvePart2(input: string): number {
  let board = parse(input);
  let hash = getBoardHash(board);
  const seen: string[] = [hash];
  const cycles = 1000000000;

  board = cycle(board);
  hash = getBoardHash(board);
  let seenAt = seen.indexOf(hash);
  while (seenAt === -1) {
    seen.push(hash);
    board = cycle(board);
    hash = getBoardHash(board);
    seenAt = seen.indexOf(hash);
  }

  const cycleLength = seen.length - seenAt;
  const remainingCycles = (cycles - seen.length) % cycleLength;

  for (let i = 0; i < remainingCycles; i++) {
    board = cycle(board);
  }

  return getScore(board);
}
