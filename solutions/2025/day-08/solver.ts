type Point = {
  x: number;
  y: number;
  z: number;
  circuit: Circuit | null;
};

type Pair = {
  p1: Point;
  p2: Point;
  distance: number;
};

type Circuit = {
  points: Set<Point>;
};

function parse(input: string): Point[] {
  return input.split("\n").map((line) => {
    const [x, y, z] = line.split(",").map(Number);
    const point: Point = { x, y, z, circuit: null };
    point.circuit = { points: new Set<Point>([point]) };
    return point;
  });
}

function getSortedPairs(data: Point[]): Pair[] {
  const pairs: Pair[] = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = i + 1; j < data.length; j++) {
      pairs.push({
        p1: data[i],
        p2: data[j],
        distance: Math.sqrt(
          Math.pow(data[i].x - data[j].x, 2) +
            Math.pow(data[i].y - data[j].y, 2) +
            Math.pow(data[i].z - data[j].z, 2)
        ),
      });
    }
  }
  return pairs.sort((a, b) => a.distance - b.distance);
}

export function solvePart1(input: string): number {
  const data = parse(input);
  const connect = data.length > 20 ? 1000 : 10;

  const pairs = getSortedPairs(data);

  // console.log(pairs);

  for (let i = 0; i < connect; i++) {
    const pair = pairs[i];

    const c1 = pair.p1.circuit;
    const c2 = pair.p2.circuit;

    let c = new Set([...c1!.points, ...c2!.points]);

    [...c].forEach((p) => (p.circuit!.points = c));
  }

  const circuits = [...new Set(data.map((p) => p.circuit?.points))].sort(
    (a, b) => b!.size - a!.size
  );

  const [a, b, c] = circuits.slice(0, 3);

  return a!.size * b!.size * c!.size;
}
export function solvePart2(input: string): number {
  const data = parse(input);
  const pairs = getSortedPairs(data);


  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];

    const c1 = pair.p1.circuit;
    const c2 = pair.p2.circuit;

    let c = new Set([...c1!.points, ...c2!.points]);

    [...c].forEach((p) => (p.circuit!.points = c));

    if (c.size === data.length) {
      return pair.p1.x * pair.p2.x;
    }
  }

  return -1;
}
