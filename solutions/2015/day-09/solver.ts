function parse(input: string) {
  return input.split("\n").map((line) => {
    const [cities, distance] = line.split(" = ");
    return { cities: cities.split(" to "), distance: parseInt(distance) };
  });
}

type Route = { to: City; distance: number };
type City = { name: string; routes: Route[] };
type Path = City[];

const asc = (a: number, b: number) => a - b;
const dsc = (a: number, b: number) => b - a;

function getPossibleRoutes(path: Path, remaining: City[]): Path[] {
  const from = path[path.length - 1];
  const possible = from.routes.filter(({ to }) => remaining.includes(to));

  if (remaining.length === 0) return [path];

  const solutions = [];

  for (const route of possible) {
    const newRemaining = remaining.filter((it) => it !== route.to);
    const newPath = [...path, route.to];
    const found = getPossibleRoutes(newPath, newRemaining);

    solutions.push(...found);
  }

  return solutions;
}

function toDistance(path: Path) {
  return path
    .map((city, index) => {
      return !index
        ? 0
        : path[index - 1].routes.find((route) => route.to === city)!.distance;
    })
    .reduce((sum, partDistance) => sum + partDistance);
}

function getPaths(input: string) {
  const routes = parse(input);
  const names = [...new Set(routes.flatMap((it) => it.cities))];

  const cities = new Map<string, City>(
    names.map((name) => [name, { name, routes: [] }])
  );

  routes.forEach((route) => {
    const { distance } = route;
    const [src, dst] = route.cities;
    const citySrc = cities.get(src)!;
    const cityDst = cities.get(dst)!;
    citySrc.routes.push({ to: cityDst, distance });
    cityDst.routes.push({ to: citySrc, distance });
  });

  const all = [];
  for (const city of cities.values()) {
    const remaining = [...cities.values()].filter((it) => it !== city);
    all.push(...getPossibleRoutes([city], remaining));
  }

  return all;
}

export function solvePart1(input: string): number {
  const [min] = getPaths(input).map(toDistance).sort(asc);
  return min;
}

export function solvePart2(input: string): number {
  const [max] = getPaths(input).map(toDistance).sort(dsc);
  return max;
}
