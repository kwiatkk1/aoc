import { getProgressLogger } from "../../../utils/debug";

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

function getIntersectionPoint(line1: Hail, line2: Hail): Point | null {
  const { position: p1, velocity: v1 } = line1;
  const { position: p2, velocity: v2 } = line2;
  const v1_cross_v2 = crossProduct(v1, v2);
  const p2_minus_p1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };

  // Check if the lines are parallel
  if (magnitude(v1_cross_v2) === 0) {
    return null;
  }

  const t =
    dotProduct(crossProduct(p2_minus_p1, v2), v1_cross_v2) /
    Math.pow(magnitude(v1_cross_v2), 2);

  if (t < 0) return null;

  return { x: p1.x + t * v1.x, y: p1.y + t * v1.y, z: p1.z + t * v1.z };
}

function crossProduct(v1: Point, v2: Point) {
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  };
}

function dotProduct(v1: Point, v2: Point) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

function magnitude(v: Point) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
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

export function solvePart1(input: string): number {
  const hails = parse(input);
  const area =
    hails.length > 10
      ? { min: 200000000000000, max: 400000000000000 }
      : { min: 7, max: 27 };
  return getCollidingWithinArea(hails, area);
}

export function solvePart2(input: string): number {
  const hails = parse(input).slice(0, 3);
  const logger = getProgressLogger();

  for (let maxRadius = 2; ; maxRadius *= 2) {
    let i = 0;
    let all = Math.pow(2 * maxRadius, 3);
    for (let x = -maxRadius; x < maxRadius; x++) {
      for (let y = -maxRadius; y < maxRadius; y++) {
        for (let z = -maxRadius; z < maxRadius; z++) {
          logger.print(`radius: ${maxRadius} / ${((++i / all) * 100).toFixed(2)}%`);
          const rockVelocity = { x, y, z };
          const [hail1, hail2, ...rest] = hails.map((hail) => ({
            ...hail,
            velocity: {
              x: hail.velocity.x - rockVelocity.x,
              y: hail.velocity.y - rockVelocity.y,
              z: hail.velocity.z - rockVelocity.z,
            },
          }));
          const collidePoint = getIntersectionPoint(hail1, hail2);

          if (!collidePoint) continue;

          const { x: cx, y: cy, z: cz } = collidePoint;
          const match = rest.every((hail) => {
            const a = (cx - hail.position.x) / hail.velocity.x;
            const b = (cy - hail.position.y) / hail.velocity.y;
            const c = (cz - hail.position.z) / hail.velocity.z;
            return a == b && b == c;
          });

          if (match) {
            logger.clear();
            return cx + cy + cz;
          }
        }
      }
    }
  }

  return 0;
}
