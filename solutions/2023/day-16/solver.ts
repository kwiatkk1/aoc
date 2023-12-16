type Tile = {
  x: number;
  y: number;
  energized: boolean;
  symbol: string;
};

type Beam = {
  x: number;
  y: number;
  dx: number;
  dy: number;
};

function parse(input: string): Tile[][] {
  return input.split("\n").map((line, row) =>
    line.split("").map((symbol, col) => ({
      y: row,
      x: col,
      symbol,
      energized: false,
    }))
  );
}

function print(data: Tile[][]): void {
  console.log(
    data
      .map((row) =>
        row.map((tile) => (tile.energized ? "#" : tile.symbol)).join("")
      )
      .join("\n")
  );
}

function beamHash({ x, y, dx, dy }: Beam): string {
  return `${x},${y},${dx},${dy}`;
}

export function solvePart1(
  input: string,
  start: Beam = { x: -1, y: 0, dx: 1, dy: 0 }
): number {
  const data = parse(input);
  const maxRow = data.length - 1;
  const maxCol = data[0].length - 1;

  let beams: Beam[] = [start];
  let trace = new Map<string, boolean>();

  while (beams.length > 0) {
    beams = beams.flatMap((beam) => {
      // move beam
      beam.y += beam.dy;
      beam.x += beam.dx;

      const hashKey = beamHash(beam);

      // beam is looping
      if (trace.has(hashKey)) return [];
      trace.set(hashKey, true);

      // beam is out of bounds
      if (beam.y > maxRow || beam.x > maxCol || beam.y < 0 || beam.x < 0) {
        return [];
      }

      const tile = data[beam.y][beam.x];
      tile.energized = true;

      const { dx, dy } = beam;
      const { symbol } = tile;

      if (symbol === "/") {
        return [{ ...beam, dx: dy * -1, dy: dx * -1 }];
      } else if (symbol === "\\") {
        return [{ ...beam, dx: dy, dy: dx }];
      } else if (symbol === "-" && dx === 0) {
        return [
          { ...beam, dx: 1, dy: 0 },
          { ...beam, dx: -1, dy: 0 },
        ];
      } else if (symbol === "|" && dy === 0) {
        return [
          { ...beam, dx: 0, dy: 1 },
          { ...beam, dx: 0, dy: -1 },
        ];
      }

      return [beam];
    });
  }

  return data.flat().reduce((acc, tile) => acc + (tile.energized ? 1 : 0), 0);
}

export function solvePart2(input: string): number {
  const data = parse(input);
  const maxRow = data.length - 1;
  const maxCol = data[0].length - 1;

  let results = [];

  for (let row = 0; row < maxRow; row++) {
    const startL = { y: row, x: -1, dx: 1, dy: 0 };
    const startR = { y: row, x: maxCol + 1, dx: -1, dy: 0 };

    results.push(solvePart1(input, startL));
    results.push(solvePart1(input, startR));
  }

  for (let col = 0; col < maxCol; col++) {
    const startT = { y: -1, x: col, dx: 0, dy: 1 };
    const startB = { y: maxRow + 1, x: col, dx: 0, dy: -1 };

    results.push(solvePart1(input, startT));
    results.push(solvePart1(input, startB));
  }

  return Math.max(...results);
}
