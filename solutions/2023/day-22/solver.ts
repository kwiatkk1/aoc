type Brick = {
  name: string;
  from: Point;
  to: Point;
  cubes: Cube[];
  supports?: Set<Brick>;
  supportedBy?: Set<Brick>;
};

type Point = {
  x: number;
  y: number;
  z: number;
};

type Cube = {
  x: number;
  y: number;
  z: number;
  brick: Brick;
};

function parse(input: string): Brick[] {
  const bricks = input.split("\n").map<Brick>((line, i) => {
    const [from, to] = line.split("~");
    const [x, y, z] = from.split(",").map(Number);
    const [x2, y2, z2] = to.split(",").map(Number);
    return {
      name: `brick-${String.fromCharCode(i + 65)}`,
      from: { x, y, z },
      to: { x: x2, y: y2, z: z2 },
      cubes: [],
      supports: new Set(),
      supportedBy: new Set(),
    };
  });

  bricks.forEach((brick) => {
    const cubes: Cube[] = [];
    for (let x = brick.from.x; x <= brick.to.x; x++) {
      for (let y = brick.from.y; y <= brick.to.y; y++) {
        for (let z = brick.from.z; z <= brick.to.z; z++) {
          cubes.push({ x, y, z, brick });
        }
      }
    }

    brick.cubes = cubes;
  });

  bricks.sort((a, b) => {
    const minZa = Math.min(a.from.z, a.to.z);
    const minZb = Math.min(b.from.z, b.to.z);
    return minZa - minZb;
  });

  bricks.forEach((brick) => {
    while (canMoveDown(brick, bricks)) moveDown(brick);
  });

  bricks.map((brick) => {
    const supportCubes = findSupportCubes(brick, bricks);
    const supportBricks = [
      ...supportCubes.reduce(
        (supportBricks, cube) => supportBricks.add(cube.brick),
        new Set<Brick>()
      ),
    ];

    brick.supportedBy = new Set(supportBricks);

    supportBricks.forEach((supportBrick) => {
      supportBrick.supports = supportBrick.supports || new Set();
      supportBrick.supports.add(brick);
    });
  });

  return bricks;
}

function canMoveDown(brick: Brick, stack: Brick[]): boolean {
  const rest = stack.filter((b) => b !== brick);
  const restCubes = rest.flatMap((b) => b.cubes);

  return brick.cubes.every((c) => {
    const inSameColumnBelow = restCubes.find(
      (rc) => rc.x === c.x && rc.y === c.y && rc.z == c.z - 1
    );
    const aboveGround = c.z > 1;
    return aboveGround && !inSameColumnBelow;
  });
}

function moveDown(brick: Brick) {
  brick.cubes.forEach((c) => (c.z -= 1));
}

function findSupportCubes(brick: Brick, stack: Brick[]) {
  const rest = stack.filter((b) => b !== brick);
  const restCubes = rest.flatMap((b) => b.cubes);

  return brick.cubes.flatMap((c) => {
    const inSameColumnBelow = restCubes.find(
      (rc) => rc.x === c.x && rc.y === c.y && rc.z == c.z - 1
    );
    return inSameColumnBelow ? [inSameColumnBelow] : [];
  });
}

function isRequired(brick: Brick) {
  const { supports = new Set() } = brick;

  for (let supported of supports) {
    const { supportedBy = new Set() } = supported;
    if (supportedBy.size === 1) {
      return true;
    }
  }

  return false;
}

function getFallCountIfRemoved(brick: Brick) {
  const fallen = new Set<Brick>();
  const toFall = [brick];

  while (toFall.length > 0) {
    const brick = toFall.shift()!;
    fallen.add(brick);

    // fall all bricks that were supported by this brick
    // and are not supported by any other not fallen brick
    const newToFall = [...brick.supports!].filter((b) => {
      const restSupport = [...b.supportedBy!].filter((sb) => !fallen.has(sb));
      return !restSupport.length;
    });

    toFall.push(...newToFall);
  }

  return fallen.size - 1;
}

export function solvePart1(input: string): number {
  return parse(input).filter((brick) => !isRequired(brick)).length;
}

export function solvePart2(input: string): number {
  return parse(input)
    .filter((brick) => isRequired(brick))
    .map((brick) => getFallCountIfRemoved(brick))
    .reduce((sum, n) => sum + n, 0);
}
