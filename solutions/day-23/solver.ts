type Coords = { x: number; y: number };

class Elf {
  passive: boolean = false;
  moved: boolean = false;

  nx: number | null = null;
  ny: number | null = null;

  constructor(public x: number, public y: number) {}

  prepare(elves: Elf[]) {
    this.passive = !this.hasNeighbours(elves);
  }

  propose(elves: Elf[], directions: Direction[]) {
    this.nx = null;
    this.ny = null;

    if (this.passive) {
      return;
    }

    for (let direction of directions) {
      const scanCoords = direction.scan(this);
      const blocked = scanCoords.some(({ x, y }) =>
        elves.find((e) => e.x === x && e.y === y)
      );

      if (!blocked) {
        const { x, y } = direction.move(this);
        this.nx = x;
        this.ny = y;
        return;
      }
    }
  }

  move(elves: Elf[]) {
    this.moved = false;

    if (this.passive) return;

    const otherElves = elves.filter((e) => e !== this);
    const isConflict = otherElves.some(
      (e) => e.nx === this.nx && e.ny === this.ny
    );

    if (!isConflict) {
      // console.log(this.x, this.y, '-->', this.nx, this.ny);
      this.x = this.nx!;
      this.y = this.ny!;
      this.moved = true;
    }
  }

  hasNeighbours(elves: Elf[]) {
    const { x, y } = this;
    const n = [
      { x: x - 1, y: y - 1 },
      { x: x + 0, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x - 1, y: y + 0 },
      { x: x + 1, y: y + 0 },
      { x: x - 1, y: y + 1 },
      { x: x + 0, y: y + 1 },
      { x: x + 1, y: y + 1 },
    ];
    return !!n
      .map((coords) => elves.find((e) => e.x === coords.x && e.y === coords.y))
      .filter((e) => !!e).length;
  }
}

function parse(input: string): Elf[] {
  const rows = input.split("\n");

  return rows.flatMap((row, y) => {
    return row.split("").flatMap((cell, x) => {
      return cell === "#" ? [new Elf(x, y)] : [];
    });
  });
}

type Direction = {
  scan: (it: Coords) => Coords[];
  move: (it: Coords) => Coords;
};

function print(elves: Elf[]) {
  const allX = elves.map((e) => e.x);
  const allY = elves.map((e) => e.y);
  const maxX = Math.max(...allX);
  const maxY = Math.max(...allY);

  const rows = [];
  for (let sy = 0; sy <= maxY; sy++) {
    const row = [];
    for (let sx = 0; sx <= maxX; sx++) {
      row.push(
        elves.find((e) => e.x === sx && e.y === sy) ? "#" : "."
      );
    }
    rows.push(row);
  }

  console.log(rows.map((row) => row.join("")).join("\n"));
}

const directions: Direction[] = [
  {
    // N
    scan: ({ x, y }: Coords): Coords[] => [
      { x: x - 1, y: y - 1 },
      { x, y: y - 1 },
      { x: x + 1, y: y - 1 },
    ],
    move: ({ x, y }: Coords): Coords => ({ x, y: y - 1 }),
  },
  {
    // S
    scan: ({ x, y }: Coords): Coords[] => [
      { x: x - 1, y: y + 1 },
      { x, y: y + 1 },
      { x: x + 1, y: y + 1 },
    ],
    move: ({ x, y }: Coords): Coords => ({ x, y: y + 1 }),
  },
  {
    // W
    scan: ({ x, y }: Coords): Coords[] => [
      { x: x - 1, y: y - 1 },
      { x: x - 1, y },
      { x: x - 1, y: y + 1 },
    ],
    move: ({ x, y }: Coords): Coords => ({ x: x - 1, y: y }),
  },
  {
    // E
    scan: ({ x, y }: Coords): Coords[] => [
      { x: x + 1, y: y - 1 },
      { x: x + 1, y },
      { x: x + 1, y: y + 1 },
    ],
    move: ({ x, y }: Coords): Coords => ({ x: x + 1, y: y }),
  },
];

export function solvePart1(input: string): number {
  const elves = parse(input);
  const dirs: Direction[] = directions.slice();

  const minX = Math.min(...elves.map(e => e.x));
  const minY = Math.min(...elves.map(e => e.y));

  const rounds = 10;

  // console.log(`=============== round 0 ===============`)
  // elves.forEach((e) => { e.x -= minX; e.y -= minY });
  // print(elves);

  for (let i = 0; i < rounds; i++) {
    // 1-st half
    elves.forEach((e) => e.prepare(elves));
    elves.forEach((e) => e.propose(elves, dirs));

    // 2-nd half
    elves.forEach((e) => e.move(elves));

    // rotate directions
    const shifted = dirs.shift()!;
    dirs.push(shifted);

    // console.log(`=============== round ${i+1} ===============`)
    //
    // const minX = Math.min(...elves.map(e => e.x));
    // const minY = Math.min(...elves.map(e => e.y));
    // elves.forEach((e) => { e.x -= minX; e.y -= minY });
    // print(elves);
  }

  const allX = elves.map((e) => e.x);
  const allY = elves.map((e) => e.y);

  const dx = Math.max(...allX) - Math.min(...allX) + 1;
  const dy = Math.max(...allY) - Math.min(...allY) + 1;

  return dx * dy - elves.length;
}

export function solvePart2(input: string): number {
  const elves = parse(input);
  const dirs: Direction[] = directions.slice();
  let stop = -1;

  for (let i = 0; i < 1e3; i++) {
    // 1-st half
    elves.forEach((e) => e.prepare(elves));
    elves.forEach((e) => e.propose(elves, dirs));

    // 2-nd half
    elves.forEach((e) => e.move(elves));

    // rotate directions
    const shifted = dirs.shift()!;
    dirs.push(shifted);

    if (!elves.some(e => e.moved)) {
      stop = i + 1;
      break;
    }
  }

  return stop;
}