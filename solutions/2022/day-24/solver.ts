import { uniqBy } from "lodash";

class Blizzard {
  constructor(
    public x: number,
    public y: number,
    public dx: number,
    public dy: number,
    public mx: number,
    public my: number
  ) {}

  getPositionAt(step: number): { x: number; y: number } {
    let x = (this.x + step * this.dx) % this.mx;
    let y = (this.y + step * this.dy) % this.my;
    return {
      x: x >= 0 ? x : this.mx + x,
      y: y >= 0 ? y : this.my + y,
    };
  }
}

function parse(input: string) {
  const allRows = input.split("\n");
  const rowsCount = allRows.length - 2;
  const colsCount = allRows[0].length - 2;

  const rows = allRows.slice(1, allRows.length - 1);

  const blizzards: Blizzard[] = [];

  rows.forEach((row, y) => {
    const cols = row.slice(1, row.length - 1).split("");

    // console.log({ row, y, cols });

    cols.forEach((char, x) => {
      // console.log({ char, x });

      if (char !== ".") {
        const dx = char === ">" ? 1 : char === "<" ? -1 : 0;
        const dy = char === "v" ? 1 : char === "^" ? -1 : 0;
        const blizzard = new Blizzard(x, y, dx, dy, colsCount, rowsCount);
        blizzards.push(blizzard);
      }
    });
  });

  return { blizzards, colsCount, rowsCount };
}

function print(
  blizzards: Blizzard[],
  rowsCount: number,
  colsCount: number,
  step: number
) {
  const list = blizzards.map((blizzard) => ({
    blizzard,
    coords: blizzard.getPositionAt(step),
  }));

  const rows = [];
  for (let y = 0; y < rowsCount; y += 1) {
    const row = [];
    for (let x = 0; x < colsCount; x += 1) {
      const blizzardsInCell = list
        .filter((it) => it.coords.x === x && it.coords.y === y)
        .map((it) => it.blizzard);

      if (blizzardsInCell.length > 1) {
        row.push(blizzardsInCell.length);
      } else if (blizzardsInCell.length === 1) {
        const blizzard = blizzardsInCell[0];

        if (blizzard.dx === 1) {
          row.push(">");
        } else if (blizzard.dx === -1) {
          row.push("<");
        } else if (blizzard.dy === -1) {
          row.push("^");
        } else if (blizzard.dy === 1) {
          row.push("v");
        }
      } else {
        row.push(".");
      }
    }
    rows.push(row);
  }

  console.log(rows.map((row) => row.join("")).join("\n"));
}

export function solvePart1(input: string): number {
  const { blizzards, colsCount, rowsCount } = parse(input);

  let places: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
  let round = 0;

  while (true) {
    round += 1;

    const blizzardPositions = blizzards.map((blizzard) => ({
      blizzard,
      coords: blizzard.getPositionAt(round),
    }));

    const nextToCheck = [
      // { x: 0, y: 0 },
      ...places.flatMap(({ x, y }) => [
        { x: x - 1, y },
        { x, y: y - 1 },
        { x, y },
        { x: x + 1, y },
        { x, y: y + 1 },
      ]),
    ];

    const nextToCheckUnique = uniqBy(nextToCheck, (it) =>
      [it.x, it.y].join("|")
    );

    places = nextToCheckUnique.flatMap(({ x, y }) => {
      if (x < 0 || y < 0 || x >= colsCount || y >= rowsCount) return [];
      if (
        blizzardPositions.some((it) => it.coords.x === x && it.coords.y === y)
      )
        return [];
      return [{ x, y }];
    });

    // print(blizzards, rowsCount, colsCount, round);
    // console.log({ round, places })

    if (places.find((it) => it.x === colsCount - 1 && it.y === rowsCount - 1)) {
      break;
    }
  }

  return round + 1;
}

export function solvePart2(input: string): number {
  const { blizzards, colsCount, rowsCount } = parse(input);

  let places: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
  let round = 0;

  while (true) {
    round += 1;

    const blizzardPositions = blizzards.map((blizzard) => ({
      blizzard,
      coords: blizzard.getPositionAt(round),
    }));

    const nextToCheck = [
      // { x: 0, y: 0 },
      ...places.flatMap(({ x, y }) => [
        { x: x - 1, y },
        { x, y: y - 1 },
        { x, y },
        { x: x + 1, y },
        { x, y: y + 1 },
      ]),
    ];

    const nextToCheckUnique = uniqBy(nextToCheck, (it) =>
      [it.x, it.y].join("|")
    );

    places = nextToCheckUnique.flatMap(({ x, y }) => {
      if (x === colsCount - 1 && y == rowsCount) return [{ x, y }];
      if (x < 0 || y < 0 || x >= colsCount || y >= rowsCount) return [];
      if (
        blizzardPositions.some((it) => it.coords.x === x && it.coords.y === y)
      )
        return [];
      return [{ x, y }];
    });

    if (places.find((it) => it.x === colsCount - 1 && it.y === rowsCount)) {
      break;
    }
  }

  // console.log("1st trip complete in", round);
  // console.log("going back...");

  // print(blizzards, rowsCount, colsCount, round);

  // go back
  places = [{ x: colsCount - 1, y: rowsCount }];

  while (true) {
    round += 1;

    const blizzardPositions = blizzards.map((blizzard) => ({
      blizzard,
      coords: blizzard.getPositionAt(round),
    }));

    const nextToCheck = [
      ...places.flatMap(({ x, y }) => [
        { x: x - 1, y },
        { x, y: y - 1 },
        { x, y },
        { x: x + 1, y },
        { x, y: y + 1 },
      ]),
    ];

    const nextToCheckUnique = uniqBy(nextToCheck, (it) =>
      [it.x, it.y].join("|")
    );

    places = nextToCheckUnique.flatMap(({ x, y }) => {
      if (x === 0 && y == -1) return [{ x, y }];
      if (x === colsCount - 1 && y == rowsCount) return [{ x, y }];
      if (x < 0 || y < 0 || x >= colsCount || y >= rowsCount) return [];
      if (
        blizzardPositions.some((it) => it.coords.x === x && it.coords.y === y)
      )
        return [];
      return [{ x, y }];
    });

    if (places.find((it) => it.x === 0 && it.y === -1)) {
      break;
    }
  }

  // console.log("2nd trip complete in", round);
  // console.log("going back...");

  // go forward again
  places = [{ x: 0, y: -1 }];
  while (true) {
    round += 1;

    const blizzardPositions = blizzards.map((blizzard) => ({
      blizzard,
      coords: blizzard.getPositionAt(round),
    }));

    const nextToCheck = [
      // { x: 0, y: 0 },
      ...places.flatMap(({ x, y }) => [
        { x: x - 1, y },
        { x, y: y - 1 },
        { x, y },
        { x: x + 1, y },
        { x, y: y + 1 },
      ]),
    ];

    const nextToCheckUnique = uniqBy(nextToCheck, (it) =>
      [it.x, it.y].join("|")
    );

    places = nextToCheckUnique.flatMap(({ x, y }) => {
      if (x === 0 && y == -1) return [{ x, y }];
      if (x === colsCount - 1 && y == rowsCount) return [{ x, y }];
      if (x < 0 || y < 0 || x >= colsCount || y >= rowsCount) return [];
      if (
        blizzardPositions.some((it) => it.coords.x === x && it.coords.y === y)
      )
        return [];
      return [{ x, y }];
    });

    if (places.find((it) => it.x === colsCount - 1 && it.y === rowsCount)) {
      break;
    }
  }

  return round;
}
