type Point = { x: number; y: number };

function parse(input: string): Point[][] {
  return input.split("\n").map((line) =>
    line.split("").map((c) => {
      if (c === "^") return { x: 0, y: -1 };
      if (c === "v") return { x: 0, y: 1 };
      if (c === "<") return { x: -1, y: 0 };
      if (c === ">") return { x: 1, y: 0 };
      throw new Error(`Unknown direction: ${c}`);
    })
  );
}

export function solvePart1(input: string): number[] {
  return parse(input).map((path) => {
    const houses = new Set<string>();
    const current = { x: 0, y: 0 };

    houses.add(`${current.x},${current.y}`);

    path.forEach((direction) => {
      current.x += direction.x;
      current.y += direction.y;
      houses.add(`${current.x},${current.y}`);
    });

    return houses.size;
  });
}

export function solvePart2(input: string): number[] {
  return parse(input).map((path) => {
    const houses = new Set<string>();
    const currents = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];

    currents.forEach((current) => {
      houses.add(`${current.x},${current.y}`);
    });

    path.forEach((direction, index) => {
      const santaIndex = index % currents.length;
      const current = currents[santaIndex];

      current.x += direction.x;
      current.y += direction.y;
      houses.add(`${current.x},${current.y}`);
    });

    return houses.size;
  });
}
