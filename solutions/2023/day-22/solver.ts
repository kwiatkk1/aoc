type Brick = {
  min: Cube;
  max: Cube;
  supportsFor: Brick[];
  supportedBy: Brick[];
};

type Cube = {
  x: number;
  y: number;
  z: number;
};

function parse(input: string): Brick[] {
  const bricks: Brick[] = input
    .split("\n")
    .map((line) => line.split(/[,~]/).map(Number))
    .map(([x1, y1, z1, x2, y2, z2]) => ({
      min: { x: Math.min(x1, x2), y: Math.min(y1, y2), z: Math.min(z1, z2) },
      max: { x: Math.max(x1, x2), y: Math.max(y1, y2), z: Math.max(z1, z2) },
      supportsFor: [],
      supportedBy: [],
    }))
    .sort((a, b) => a.min.z - b.min.z);

  // let all bricks to settle down
  bricks.forEach((brick) => freeFall(brick, bricks));

  // build a graph of bricks
  bricks.forEach((brick) => {
    const supportedBy = findSupportBricks(brick, bricks);
    brick.supportedBy = supportedBy;
    supportedBy.forEach((support) => support.supportsFor.push(brick));
  });

  return bricks;
}

function getBricksUnder(brick: Brick, allBricks: Brick[]) {
  return (
    allBricks
      // find all bricks that are beneath the brick
      .filter((it) => it.max.z < brick.min.z)

      // leave only bricks that are intersecting on x
      .filter((it) => it.min.x <= brick.max.x && it.max.x >= brick.min.x)

      // leave only bricks that are intersecting on y
      .filter((it) => it.min.y <= brick.max.y && it.max.y >= brick.min.y)

      // sort to find the highest laying brick
      .sort((a, b) => b.max.z - a.max.z)
  );
}

function freeFall(brick: Brick, bricks: Brick[]) {
  const [firstBrickUnder] = getBricksUnder(brick, bricks);
  const brickHeight = brick.max.z - brick.min.z;
  const dropPoint = firstBrickUnder ? firstBrickUnder.max.z + 1 : 0;

  brick.min.z = dropPoint;
  brick.max.z = dropPoint + brickHeight;
}

function findSupportBricks(brick: Brick, stack: Brick[]) {
  const levelBelow = brick.min.z - 1;
  return getBricksUnder(brick, stack).filter((b) => b.max.z === levelBelow);
}

function isRequired(brick: Brick) {
  return brick.supportsFor.some((it) => it.supportedBy.length === 1);
}

function getImpactedCount(startBrick: Brick) {
  const impactedBricks = new Set<Brick>();
  const toFall = [startBrick];

  while (toFall.length > 0) {
    const fallingBrick = toFall.shift()!;
    impactedBricks.add(fallingBrick);

    fallingBrick.supportsFor.forEach((brick) => {
      const isImpacted = brick.supportedBy.every((support) =>
        impactedBricks.has(support)
      );
      if (isImpacted) toFall.push(brick);
    });
  }

  return impactedBricks.size - 1;
}

function sum(a: number, b: number) {
  return a + b;
}

export function solvePart1(input: string): number {
  return parse(input).filter((brick) => !isRequired(brick)).length;
}

export function solvePart2(input: string): number {
  return parse(input).filter(isRequired).map(getImpactedCount).reduce(sum);
}
