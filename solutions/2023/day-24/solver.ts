type Hail = {
  position: Point;
  velocity: Point;
  line: { a: number; b: number; c: number };
};

type Point = {
  x: number;
  y: number;
  z: number;
};

function positionAt(hail: Hail, t: number): Point {
  return {
    x: hail.position.x + t * hail.velocity.x,
    y: hail.position.y + t * hail.velocity.y,
    z: hail.position.z + t * hail.velocity.z,
  };
}

function getCollidingWithinArea(
  hails: Hail[],
  area: { min: number; max: number }
) {
  let collidingCount = 0;

  for (let i = 0; i < hails.length; i++) {
    for (let j = i + 1; j < hails.length; j++) {
      collidingCount += areCollidingWithin(hails[i], hails[j], area) ? 1 : 0;
    }
  }

  return collidingCount;
}

function areCollidingWithin(
  hail1: Hail,
  hail2: Hail,
  area: { min: number; max: number }
) {
  const { a: a1, b: b1, c: c1 } = hail1.line;
  const { a: a2, b: b2, c: c2 } = hail2.line;
  const d = a1 * b2 - a2 * b1;

  if (d === 0) return false;

  const collidePoint = {
    x: (b1 * c2 - b2 * c1) / d,
    y: -(a1 * c2 - a2 * c1) / d,
  };

  const isWithinArea =
    collidePoint.x >= area.min &&
    collidePoint.x <= area.max &&
    collidePoint.y >= area.min &&
    collidePoint.y <= area.max;

  const isInFuture = [hail1, hail2].every((hail) => {
    const dx = Math.sign(collidePoint.x - hail.position.x);
    const dy = Math.sign(collidePoint.y - hail.position.y);
    return (
      dx === Math.sign(hail.velocity.x) && dy === Math.sign(hail.velocity.y)
    );
  });

  return isWithinArea && isInFuture;
}

function parse(input: string) {
  return input.split("\n").map<Hail>((it) => {
    const parts = it.split(" @ ");
    const [position, velocity] = parts.map((part) => {
      const [x, y, z] = part.split(", ").map(Number);
      return { x, y, z };
    });
    const line = {
      a: -velocity.y,
      b: velocity.x,
      c: position.x * velocity.y - position.y * velocity.x,
    };

    return { position, velocity, line };
  });
}

function getLineFormula(p1: Point, p2: Point, t1: number, t2: number) {
  const dt = t2 - t1;
  const l = (p2.x - p1.x) / dt;
  const m = (p2.y - p1.y) / dt;
  const n = (p2.z - p1.z) / dt;

  return (t: number): Point => {
    return {
      x: p1.x + (t - t1) * l,
      y: p1.y + (t - t1) * m,
      z: p1.z + (t - t1) * n,
    };
  };
}

function equals(p1: Point, p2: Point) {
  return p1.x === p2.x && p1.y === p2.y && p1.z === p2.z;
}

export function solvePart1(input: string): number {
  const hails = parse(input);
  const area =
    hails.length > 10
      ? { min: 200000000000000, max: 400000000000000 }
      : { min: 7, max: 27 };
  return getCollidingWithinArea(hails, area);
}
export function solvePart2(input: string): number {
  const hails = parse(input);
  let round = 0;
  const positions: Point[][] = [];

  while (true) {
    positions.push(hails.map((h) => positionAt(h, round)));

    for (let i1 = 0; i1 < hails.length; i1++) {
      for (let i2 = 0; i2 < hails.length; i2++) {
        if (i1 === i2) continue;

        for (let t1 = 0; t1 < positions.length; t1++) {
          for (let t2 = 0; t2 < positions.length; t2++) {
            const p1 = positions[t1][i1];
            const p2 = positions[t2][i2];

            const f = getLineFormula(p1, p2, t1, t2);

            const allGood = hails.every((hail, i) => {
              if (i === i1 || i === i2) return true;
              const res = positions
                .map((position) => position[i])
                .some((p, t) => equals(f(t), p));

              return res;
            });

            if (allGood) {
              const res = f(0);
              return res.x + res.y + res.z;
            }
          }
        }
      }
    }

    round += 1;
  }
}