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
  const data = parse(input);
  return data.length;
}
