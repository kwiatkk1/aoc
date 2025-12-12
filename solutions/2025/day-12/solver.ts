type Shape = string[][];

type Region = {
  size: {
    w: number;
    h: number;
  };
  presents: number[];
};

type Fit = { shape: Shape; x: number; y: number };

type Canvas = boolean[][];

function parse(input: string) {
  const parts = input.split("\n\n");
  const regions = parts
    .pop()!
    .split("\n")
    .map((region) => {
      const [size, presents] = region.split(": ");
      const [w, h] = size.split("x").map(Number);
      return {
        size: { w, h },
        presents: presents.split(" ").map(Number),
      };
    });

  const shapes = parts.map((shape) => shape.split("\n").slice(1));

  return { shapes, regions };
}

function rotateLeft(pattern: Shape): Shape {
  const result: Shape = [];
  const rowsCount = pattern.length;
  const colsCount = pattern[0].length;

  for (let col = 0; col < colsCount; col++) {
    const current: string[] = [];
    for (let row = 0; row < rowsCount; row++) {
      current.push(pattern[row][colsCount - 1 - col]);
    }
    result.push(current);
  }

  return result;
}

const findFits = (s: Shape, canvas: Canvas): Fit[] => {
  const fits: Fit[] = [];

  const f90 = rotateLeft(s);
  const f180 = rotateLeft(f90);
  const f270 = rotateLeft(f180);

  const variants = [s, f90, f180, f270];

  for (let y = 0; y < canvas.length - 2; y++) {
    for (let x = 0; x < canvas[0].length - 2; x++) {
      if (canvas[y][x]) continue;

      for (let iv = 0; iv < variants.length; iv++) {
        let s = variants[iv];

        let posMatch = true;
        outer: for (let dy = 0; dy < s.length; dy++) {
          for (let dx = 0; dx < s[0].length; dx++) {
            if (s[dy][dx] === "#" && canvas[y + dy][x + dx] === true) {
              posMatch = false;
              break outer;
            }
          }
        }
        if (posMatch) fits.push({ shape: s, x, y });
      }
    }
  }

  return fits;
};

const hasSolution = (region: Region, shapes: any) => {
  let limit = 10e3; // :(
  const canvas = Array.from({ length: region.size.h }, () =>
    Array.from({ length: region.size.w }, () => false)
  );

  const toFit = region.presents.flatMap((count, idx) => {
    return Array.from({ length: count }, () => shapes[idx]);
  });

  const findFit = (remaining: Shape[]): boolean => {
    if (remaining.length === 0) {
      return true;
    }

    if (limit-- < 0) return false;

    const fits = findFits(remaining[0], canvas);

    for (let i = 0; i < fits.length; i++) {
      const s = fits[i].shape;

      // apply to canvas
      for (let dy = 0; dy < s.length; dy++) {
        for (let dx = 0; dx < s[0].length; dx++) {
          if (s[dy][dx] === "#") canvas[fits[i].y + dy][fits[i].x + dx] = true;
        }
      }

      if (findFit(remaining.slice(1))) {
        return true;
      }

      // remove from canvas
      for (let dy = 0; dy < s.length; dy++) {
        for (let dx = 0; dx < s[0].length; dx++) {
          if (s[dy][dx] === "#") canvas[fits[i].y + dy][fits[i].x + dx] = false;
        }
      }
    }

    return false;
  };

  return findFit(toFit);
};

export function solvePart1(input: string): number {
  const { shapes, regions } = parse(input);
  return regions.filter((it, i) => hasSolution(it, shapes)).length;
}
