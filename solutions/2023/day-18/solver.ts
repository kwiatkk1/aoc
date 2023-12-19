type Direction = {
  x: number;
  y: number;
};

type Command = {
  direction: Direction;
  step: number;
};

type Node = Direction & {};
type Wall = {
  from: Node;
  to: Node;
};

const directions: Record<string, Direction> = {
  R: { x: 1, y: 0 },
  L: { x: -1, y: 0 },
  U: { x: 0, y: -1 },
  D: { x: 0, y: 1 },
};

const numDirections: Record<string, string> = {
  0: "R",
  1: "D",
  2: "L",
  3: "U",
};

function parse(input: string) {
  const lines = input.split("\n");
  const part1: Command[] = [];
  const part2: Command[] = [];

  lines.forEach((line) => {
    const [dirSymbol, n, color] = line.split(" ");

    part1.push({
      direction: directions[dirSymbol],
      step: Number(n),
    });

    part2.push({
      direction: directions[numDirections[color.substring(7, 8)]],
      step: parseInt(color.substring(2, 7), 16),
    });
  });

  return { part1, part2 };
}

function isStartingAt({ x, y }: Node) {
  return ({ from }: Wall) => from.x === x && from.y === y;
}

function mergeAt(cols: Wall[], x: number): Wall[] {
  const columnsAtX = cols
    .filter((col) => col.from.x === x)
    .sort((a, b) => a.from.y - b.from.y || a.to.y - b.to.y);
  const rest = cols.filter((col) => col.from.x !== x);

  let merged: Wall[] = [columnsAtX[0]];

  for (let i = 1; i < columnsAtX.length; i++) {
    const col = columnsAtX[i];
    const prev = merged[merged.length - 1];
    if (prev.to.y === col.from.y) {
      merged[merged.length - 1] = {
        from: prev.from,
        to: col.to,
      };
    } else {
      merged.push(col);
    }
  }

  return [...merged, ...rest]
    .sort((a, b) => b.from.x - a.from.x || b.from.y - a.from.y)
    .filter((it) => it);
}

function trimRows(rows: Wall[], col: Wall, allCols: Wall[]): Wall[] {
  const newX = col.from.x;
  const minY = Math.min(col.from.y, col.to.y);
  const maxY = Math.max(col.to.y, col.from.y);

  rows = rows.map((row) => {
    const inColVRange = row.from.y >= minY && row.from.y <= maxY;
    const inColXRange = row.from.x <= newX && row.to.x >= newX;

    if (inColVRange && inColXRange) {
      return {
        from: { x: newX, y: row.from.y },
        to: { x: row.to.x, y: row.to.y },
      };
    }

    return row;
  });

  return rows
    .filter((row) => row.from.x !== row.to.x)
    .sort((a, b) => a.from.x - b.from.x || a.to.x - b.to.x);
}

function splitWall(wall: Wall, cols: Wall[]): Wall[] {
  const { from, to } = wall;
  const newCols: Wall[] = [];
  cols.sort((a, b) => a.from.y - b.from.y);

  let startY = from.y;

  for (let i = 0; i < cols.length; i++) {
    const col = cols[i];
    if (col.from.y > startY) {
      newCols.push({
        from: { x: from.x, y: startY },
        to: { x: from.x, y: col.from.y },
      });
    }
    startY = col.to.y;
  }

  if (startY < to.y) {
    newCols.push({
      from: { x: from.x, y: startY },
      to: { x: from.x, y: to.y },
    });
  }

  return newCols;
}

export function solve(commands: Command[]): number {
  const walls: Wall[] = [];
  let surface = 0;

  commands.reduce(
    (prev, cmd) => {
      const next = {
        x: prev.x + cmd.direction.x * cmd.step,
        y: prev.y + cmd.direction.y * cmd.step,
      };
      walls.push({ from: prev, to: next });
      return next;
    },
    { x: 0, y: 0 }
  );

  let rows = walls
    .filter((it) => it.from.y == it.to.y)
    .map((it) => {
      const { from, to } = it;
      return { from: from.x < to.x ? from : to, to: from.x < to.x ? to : from };
    })
    .sort((a, b) => a.from.x - b.from.x || a.to.x - b.to.x);

  let cols = walls
    .filter((it) => it.from.x == it.to.x)
    .sort((a, b) => b.from.x - a.from.x)
    .map((it) => {
      const { from, to } = it;
      return { from: from.y < to.y ? from : to, to: from.y < to.y ? to : from };
    })
    .sort((a, b) => b.from.x - a.from.x || b.from.y - a.from.y);

  while (cols.length) {
    const wallL = cols.pop()!;
    const wallT = rows.find(isStartingAt(wallL.to));
    const wallB = rows.find(isStartingAt(wallL.from));
    const height = wallL.to.y - wallL.from.y + 1;

    const innerWalls = cols
      .filter((col) => {
        const maxX = Math.min(
          wallT ? wallT.to.x : Infinity,
          wallB ? wallB.to.x : Infinity
        );
        return (
          col.from.x <= maxX &&
          col.from.y >= wallL.from.y &&
          col.to.y <= wallL.to.y
        );
      })
      .sort((a, b) => a.from.x - b.from.x);

    const wallRx = Math.min(
      wallT ? wallT.to.x : Infinity,
      wallB ? wallB.to.x : Infinity,
      innerWalls[0] ? innerWalls[0].from.x : Infinity
    );

    const newWallR = {
      from: { x: wallRx, y: wallL.from.y },
      to: { x: wallRx, y: wallL.to.y },
    };

    if (!innerWalls.length) {
      const area = height * (wallRx - wallL.from.x);
      surface = surface + area;

      cols.push(newWallR);
      cols = mergeAt(cols, newWallR.from.x);
      rows = trimRows(rows, newWallR, cols);
    } else {
      const excluded = innerWalls.filter(
        (it) => it.from.x === innerWalls[0].from.x
      );

      const newCols = splitWall(newWallR, excluded);
      cols = cols.filter((it) => !excluded.includes(it));

      cols.push(...newCols);
      cols = mergeAt(cols, newWallR.from.x);

      const area = height * (wallRx - wallL.from.x + 1);
      const newColsArea = newCols.reduce(
        (sum, col) => col.to.y - col.from.y + 1 + sum,
        0
      );
      surface = surface + area - newColsArea;
      rows = trimRows(rows, newWallR, cols);
    }
  }

  return surface;
}

export function solvePart1(input: string): number {
  const { part1 } = parse(input);
  return solve(part1);
}

export function solvePart2(input: string): number {
  const { part2 } = parse(input);
  return solve(part2);
}
