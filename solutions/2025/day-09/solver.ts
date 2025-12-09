type Tile = { x: number; y: number };

const asc = (a: number, b: number) => a - b;
const isEven = (it: number) => it % 2 == 0;

function parse(input: string): Tile[] {
  return input.split("\n").map((line) => {
    const [x, y] = line.split(",").map(Number);
    return { x, y };
  });
}

export function solvePart1(input: string): number {
  const redTiles = parse(input);
  const max = { area: 0 };

  for (let i = 0; i < redTiles.length; i++) {
    for (let j = i + 1; j < redTiles.length; j++) {
      const [a, b] = [redTiles[i], redTiles[j]];
      const area = (Math.abs(b.x - a.x) + 1) * (Math.abs(b.y - a.y) + 1);
      if (area > max.area) max.area = area;
    }
  }

  return max.area;
}

type LineH = { x1: number; x2: number; y: number };
type LineV = { x: number; y1: number; y2: number };

export function solvePart2(input: string): number {
  const redTiles = parse(input);

  // the tile furthest to the left and up
  const [startTile] = [...redTiles].sort((a, b) => a.x - b.x || a.y - b.y);

  const tilesInWalkOrder = [
    ...redTiles.slice(redTiles.indexOf(startTile), redTiles.length),
    ...redTiles.slice(0, redTiles.indexOf(startTile)),
  ];

  const directions = tilesInWalkOrder
    // to pairs
    .map((tile, i) => {
      const next = tilesInWalkOrder[(i + 1) % tilesInWalkOrder.length];
      return { src: tile, dst: next };
    })
    // to directions
    .map(({ src, dst }, i) => {
      if (src.x === dst.x) {
        return {
          dir: src.y > dst.y ? "N" : "S",
          d: Math.abs(src.y - dst.y),
        };
      } else {
        return {
          dir: src.x > dst.x ? "W" : "E",
          d: Math.abs(src.x - dst.x),
        };
      }
    });

  // draw a border around the shape described in the instructions
  const borders: Array<LineH | LineV> = [];
  const padding = 0.5;

  // assuming startTile is the top-leftmost tile, start with an offset
  let currPoint = {
    x: startTile.x - padding,
    y: startTile.y - padding,
    dir: "N",
  };

  for (let i = 0; i < directions.length; i++) {
    const thisLine = directions[i];
    const nextLine = directions[(i + 1) % directions.length];
    let nextPoint = { x: 0, y: 0, dir: thisLine.dir };
    let sameDir = currPoint.dir === nextLine.dir;

    if (thisLine.dir === "E") {
      nextPoint = {
        x:
          currPoint.x +
          thisLine.d +
          (sameDir ? 0 : nextLine.dir === "N" ? -1 : 1) * 2 * padding,
        y: currPoint.y,
        dir: "E",
      };
      borders.push({
        y: currPoint.y,
        x1: currPoint.x,
        x2: nextPoint.x,
      });
    } else if (thisLine.dir === "W") {
      nextPoint = {
        x:
          currPoint.x -
          thisLine.d +
          (sameDir ? 0 : nextLine.dir === "N" ? -1 : 1) * 2 * padding,
        y: currPoint.y,
        dir: "W",
      };
      borders.push({
        y: currPoint.y,
        x1: nextPoint.x,
        x2: currPoint.x,
      });
    } else if (thisLine.dir === "N") {
      nextPoint = {
        x: currPoint.x,
        y:
          currPoint.y -
          thisLine.d +
          (sameDir ? 0 : nextLine.dir === "E" ? -1 : 1) * 2 * padding,
        dir: "N",
      };
      borders.push({
        x: currPoint.x,
        y1: nextPoint.y,
        y2: currPoint.y,
      });
    } else if (thisLine.dir === "S") {
      nextPoint = {
        x: currPoint.x,
        y:
          currPoint.y +
          thisLine.d +
          (sameDir ? 0 : nextLine.dir === "E" ? -1 : 1) * 2 * padding,
        dir: "S",
      };
      borders.push({
        x: currPoint.x,
        y1: currPoint.y,
        y2: nextPoint.y,
      });
    }

    currPoint = nextPoint;
  }

  const hLines = borders.filter((fence): fence is LineH =>
    fence.hasOwnProperty("y")
  );
  const vLines = borders.filter((fence): fence is LineV =>
    fence.hasOwnProperty("x")
  );

  // use the even–odd rule algorithm
  const getCrossings = (t: Tile) => ({
    h: vLines.filter((it) => it.x < t.x && t.y > it.y1 && t.y < it.y2).length,
    v: hLines.filter((it) => it.y < t.y && t.x > it.x1 && t.x < it.x2).length,
  });

  const max = {
    area: 0,
  };

  for (let i = 0; i < redTiles.length; i++) {
    for (let j = i + 1; j < redTiles.length; j++) {
      const [tileA, tileB] = [redTiles[i], redTiles[j]];
      const [xMin, xMax] = [tileA.x, tileB.x].sort(asc);
      const [yMin, yMax] = [tileA.y, tileB.y].sort(asc);
      const area = (xMax - xMin + 1) * (yMax - yMin + 1);

      // rectangle
      const vertexes = {
        a: { x: xMin, y: yMin },
        b: { x: xMax, y: yMin },
        c: { x: xMax, y: yMax },
        d: { x: xMin, y: yMax },
      };

      const crossings = {
        a: getCrossings(vertexes.a),
        b: getCrossings(vertexes.b),
        c: getCrossings(vertexes.c),
        d: getCrossings(vertexes.d),
      };

      if (
        crossings.a.h !== crossings.b.h ||
        crossings.a.v !== crossings.d.v ||
        crossings.b.v !== crossings.c.v ||
        crossings.d.h !== crossings.c.h ||
        Object.values(crossings)
          .flatMap((it) => [it.h, it.v])
          .some(isEven)
      ) {
        continue;
      }

      if (area > max.area) {
        max.area = area;
      }
    }
  }

  return max.area;
}
