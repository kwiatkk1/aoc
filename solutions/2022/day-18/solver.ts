import { groupBy } from "lodash";

function parse(input: string): number[][] {
  return input
    .split("\n")
    .map((cords) => cords.split(",").map((d) => parseInt(d)));
}

export function solvePart1(input: string): number {
  const pixels = parse(input);

  const pixelsByX = groupBy(pixels, (it) => it[0]);
  const pixelsByY = groupBy(pixels, (it) => it[1]);
  const pixelsByZ = groupBy(pixels, (it) => it[2]);

  const sum = pixels
    .map((pixel) => {
      return [
        pixelsByX[pixel[0] - 1]?.some(
          (it) => it[1] === pixel[1] && it[2] === pixel[2]
        )
          ? 0
          : 1,
        pixelsByX[pixel[0] - 1]?.some(
          (it) => it[1] === pixel[1] && it[2] === pixel[2]
        )
          ? 0
          : 1,
        pixelsByY[pixel[1] - 1]?.some(
          (it) => it[0] === pixel[0] && it[2] === pixel[2]
        )
          ? 0
          : 1,
        pixelsByY[pixel[1] - 1]?.some(
          (it) => it[0] === pixel[0] && it[2] === pixel[2]
        )
          ? 0
          : 1,
        pixelsByZ[pixel[2] - 1]?.some(
          (it) => it[0] === pixel[0] && it[1] === pixel[1]
        )
          ? 0
          : 1,
        pixelsByZ[pixel[2] - 1]?.some(
          (it) => it[0] === pixel[0] && it[1] === pixel[1]
        )
          ? 0
          : 1,
      ].reduce((sum, it) => sum + it, 0);
    })
    .reduce((sum, it) => sum + it, 0);

  return sum;
}

const is =
  ({ x, y, z }: Point) =>
  (it: Point) =>
    it.x === x && it.y === y && it.z === z;

type Point = { x: number; y: number; z: number };

export function solvePart2(input: string): number {
  const pixels: Point[] = parse(input).map(([x, y, z]) => ({ x, y, z }));

  const min = {
    x: Math.min(...pixels.map(({ x }) => x)) - 2,
    y: Math.min(...pixels.map(({ y }) => y)) - 2,
    z: Math.min(...pixels.map(({ z }) => z)) - 2,
  };

  const max = {
    x: Math.max(...pixels.map(({ x }) => x)) + 2,
    y: Math.max(...pixels.map(({ y }) => y)) + 2,
    z: Math.max(...pixels.map(({ z }) => z)) + 2,
  };

  const toVisit: Point[] = [min];
  const visited: Point[] = [];
  let current: Point;
  let count: number = 0;

  // @ts-ignore
  while ((current = toVisit.pop())) {
    const neighbours = [
      { x: current.x - 1, y: current.y, z: current.z },
      { x: current.x + 1, y: current.y, z: current.z },
      { x: current.x, y: current.y - 1, z: current.z },
      { x: current.x, y: current.y + 1, z: current.z },
      { x: current.x, y: current.y, z: current.z - 1 },
      { x: current.x, y: current.y, z: current.z + 1 },
    ].filter(
      ({ x, y, z }) =>
        x >= min.x &&
        x <= max.x &&
        y >= min.y &&
        y <= max.y &&
        z >= min.z &&
        z <= max.z
    );

    visited.push(current);

    neighbours.forEach(({ x, y, z }) => {
      const isLava = pixels.find(is({ x, y, z }));

      if (isLava) {
        count += 1;
      } else if (!visited.find(is({ x, y, z }))) {
        if (!toVisit.find(is({ x, y, z })))
          toVisit.push({ x, y, z });
      }
    });
  }

  return count;
}
