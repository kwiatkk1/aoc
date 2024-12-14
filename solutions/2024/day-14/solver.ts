type Position = { x: number; y: number };
type Velocity = { dx: number; dy: number };
type Bounds = { w: number; h: number };
type Robot = Position & Bounds & Velocity;

function parse(input: string): Robot[] {
  const lines = input.split("\n");
  const isTest = lines.length < 20;
  const { w, h } = isTest ? { w: 11, h: 7 } : { w: 101, h: 103 };

  return lines.map((line) => {
    const [p, v] = line.split(" ");
    const [x, y] = p.substring(2).split(",").map(Number);
    const [dx, dy] = v.substring(2).split(",").map(Number);
    return { x, y, dx, dy, w, h };
  });
}

function print(positions: Position[]): void {
  const w = Math.max(...positions.map((it) => it.x));
  const h = Math.max(...positions.map((it) => it.y));

  for (let row = 0; row < h; row++) {
    let line = "";
    for (let col = 0; col < w; col++) {
      const c = positions.filter(({ x, y }) => x === col && y === row).length;
      line += c || ".";
    }
    console.log(line);
  }
}

function getPositionAfter(robot: Robot, round: number): Position {
  const { w, h, dx, dy } = robot;
  const x = (w + robot.x + ((dx * round) % w)) % w;
  const y = (h + robot.y + ((dy * round) % h)) % h;
  return { x, y };
}

export function solvePart1(input: string): number {
  const robots = parse(input);
  const rounds = 100;
  const { w, h } = robots[0];

  const positions = robots.map((it) => getPositionAfter(it, rounds));

  const quadrants = [
    { maxX: Math.floor(w / 2), maxY: Math.floor(h / 2) },
    { maxX: Math.floor(w / 2), minY: Math.ceil(h / 2) },
    { minX: Math.ceil(w / 2), maxY: Math.floor(h / 2) },
    { minX: Math.ceil(w / 2), minY: Math.ceil(h / 2) },
  ];

  return quadrants
    .map((q) => {
      let inQuadrant = [...positions];
      if (q.maxX) inQuadrant = inQuadrant.filter((it) => it.x < q.maxX);
      if (q.minX) inQuadrant = inQuadrant.filter((it) => it.x >= q.minX);
      if (q.maxY) inQuadrant = inQuadrant.filter((it) => it.y < q.maxY);
      if (q.minY) inQuadrant = inQuadrant.filter((it) => it.y >= q.minY);
      return inQuadrant.length;
    })
    .reduce((a, b) => a * b, 1);
}

export function solvePart2(input: string): number {
  const robots = parse(input);

  let round = 0;
  let found: Position[] | null = null;

  rounds: while (!found) {
    const positions: Position[] = [];
    const unique = new Set<string>();
    round += 1;

    for (let i = 0; i < robots.length; i++) {
      const { x, y } = getPositionAfter(robots[i], round);
      positions.push({ x, y });
      unique.add(`${x},${y}`);
      if (positions.length !== unique.size) continue rounds;
    }

    found = positions;
  }

  // found && print(found);

  return round;
}
