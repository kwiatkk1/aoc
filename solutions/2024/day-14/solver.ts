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

function isEveryRobotOnOwnPosition(robots: Robot[], round: number): boolean {
  const positions: Position[] = [];
  const unique = new Set<string>();

  for (let i = 0; i < robots.length; i++) {
    const { x, y } = getPositionAfter(robots[i], round);
    positions.push({ x, y });
    unique.add(`${x},${y}`);
    if (positions.length !== unique.size) return false;
  }

  return true;
}

function hasDiagonalLine(robots: Robot[], round: number): boolean {
  const positions = robots.map((it) => getPositionAfter(it, round));
  const diagonalSize = 5;

  positions.sort((a, b) => a.x - b.x || a.y - b.y);

  for (let i = 0; i < positions.length; i++) {
    const followingPositions = positions.slice(i);
    const followingDiagonals = followingPositions
      .filter((it) => it.x - positions[i].x <= diagonalSize)
      .filter((it) => it.x - positions[i].x === it.y - positions[i].y);

    let found = true;
    for (let j = 0; j < diagonalSize; j++) {
      const hasFollowing =
        followingDiagonals.filter(
          (it) => it.x === positions[i].x + j && it.y === positions[i].y + j
        ).length == 1;
      if (!hasFollowing) {
        found = false;
        break;
      }
    }
    if (found) return true;
  }

  return false;
}

function isTriangleFormed(robots: Robot[], round: number): boolean {
  const positions = robots.map((it) => getPositionAfter(it, round));
  const { w, h } = robots[0];
  const diagonalSize = 5;

  for (let row = 0; row < h - diagonalSize; row++) {
    inner: for (let col = 0; col < w - diagonalSize; col++) {
      const window = positions.filter(
        (it) =>
          it.x >= row &&
          it.x < row + diagonalSize &&
          it.y >= col &&
          it.y < col + diagonalSize
      );

      for (let y = 0; y < diagonalSize; y++) {
        for (let x = 0; x < diagonalSize; x++) {
          const hasSomething = !!window.find(
            (it) => it.x === x + row && it.y === y + col
          );
          const shouldHaveSomething = diagonalSize - y <= x;
          if (hasSomething !== shouldHaveSomething) continue inner;
        }
      }

      console.log("Found triangle at", row, col);
      for (let y = 0; y < diagonalSize; y++) {
        let line = "";
        for (let x = 0; x < diagonalSize; x++) {
          const hasSomething = positions.filter(
            (it) => it.x === x + row && it.y === y + col
          ).length;
          line += hasSomething ? `${hasSomething}` : ".";
        }
        console.log(line);
      }
      return true;
    }
  }

  return false;
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
  let found = false;

  while (!found) {
    round += 1;

    // found = hasDiagonalLine(robots, round);
    // found = isTriangleFormed(robots, round);
    found = isEveryRobotOnOwnPosition(robots, round);
  }

  const positions = robots.map((it) => getPositionAfter(it, round));
  print(positions);

  return round;
}
