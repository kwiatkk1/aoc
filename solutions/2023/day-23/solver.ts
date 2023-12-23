type Node<T> = T & {
  isInit?: boolean;
  isExit?: boolean;
  neighbors: Edge<Node<T>>[];
};

type Path = Node<{
  row: number;
  col: number;
  type: string;
  crossroads?: Crossroads;
}>;

type Crossroads = Node<{
  path: Path;
}>;

type Edge<T> = { destination: T; available: boolean; distance: number };

function isPath(tile: Path) {
  return !!tile && tile.type !== "#";
}

function isUphill(src: Path, dst: Path) {
  const isAbove = dst.row < src.row;
  const isOnLeft = dst.col < src.col;
  const isSlope = "v>".includes(dst.type);
  return (isAbove && isSlope) || (isOnLeft && isSlope);
}

function getGraph(input: string, { noUphill = false } = {}) {
  const board = input
    .split("\n")
    .map((line, row) =>
      line
        .split("")
        .map<Path>((type, col) => ({ row, col, type, neighbors: [] }))
    );

  const paths = board.flat().filter(isPath);

  paths[0].isInit = true;
  paths[paths.length - 1].isExit = true;

  for (const tile of paths) {
    const { row, col } = tile;
    const neighbors = [
      board[row - 1]?.[col],
      board[row + 1]?.[col],
      board[row]?.[col - 1],
      board[row]?.[col + 1],
    ].filter(isPath);

    tile.neighbors = neighbors.map((neighbor) => ({
      destination: neighbor,
      available: noUphill ? !isUphill(tile, neighbor) : true,
      distance: 1,
    }));
  }

  const crossroads = paths
    .filter((tile) => tile.neighbors.length !== 2)
    .map((tile) => {
      const node: Crossroads = { path: tile, neighbors: [] };
      tile.crossroads = node;
      return node;
    });

  crossroads.forEach((node) => {
    node.neighbors = node.path.neighbors.flatMap((current: Edge<Path>) => {
      let distance = 1;
      let prev = node.path;
      let available = current.available;

      while (!current.destination.crossroads) {
        distance += current.distance;

        [prev, current] = [
          current.destination,
          current.destination.neighbors.filter(
            (it: Edge<Path>) => it.destination !== prev
          )[0],
        ];
      }

      if (!current) return [];

      return [
        {
          destination: current.destination.crossroads,
          available,
          distance,
        },
      ];
    });
  });
  crossroads[0].isInit = true;
  crossroads[crossroads.length - 1].isExit = true;

  return { paths, crossroads };
}

function getAllRoutes<T>(paths: Node<T>[]): T[][] {
  const routes: T[][] = [];
  const start = paths.find((it) => it.isInit)!;
  const stack = [[start]];

  while (stack.length > 0) {
    const route = stack.pop()!;
    const cPath = route[route.length - 1];

    if (cPath.isExit) {
      routes.push(route);
    } else {
      cPath.neighbors
        .filter((it) => it.available)
        .filter((it) => !route.includes(it.destination))
        .forEach((it) => stack.push([...route, it.destination]));
    }
  }

  return routes;
}

function getRouteTotalLength<T>(path: Node<T>[]): number {
  return path
    .map((node, i) =>
      i < 1
        ? 0
        : node.neighbors.find(({ destination }) => destination === path[i - 1])!
            .distance
    )
    .reduce((a, b) => a + b);
}

function solve(input: string, { noUphill = false } = {}) {
  const { crossroads } = getGraph(input, { noUphill });

  return (
    getAllRoutes<Crossroads>(crossroads)
      .map(getRouteTotalLength)
      .sort((a, b) => a - b)
      .pop() || 0
  );
}

export function solvePart1(input: string): number {
  return solve(input, { noUphill: true });
}

export function solvePart2(input: string): number {
  return solve(input, { noUphill: false });
}
