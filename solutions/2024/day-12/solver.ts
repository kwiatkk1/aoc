import { Board, BoardNode, Direction } from "../../../utils/board";

type Plant = string;
type Fence = { row: number; col: number; facing: Direction };
type FenceSide = Fence[];
type Region = {
  nodes: BoardNode<Plant>[];
  fences: Fence[];
  sides: FenceSide[];
};

const sum = (a: number, b: number) => a + b;

function parse(input: string): Board<Plant> {
  return Board.from(input, ({ char }) => char);
}

const isNextRow = (a: Fence, b: Fence) =>
  a.facing === b.facing && a.col === b.col && Math.abs(a.row - b.row) === 1;

const isNextCol = (a: Fence, b: Fence) =>
  a.facing === b.facing && a.row === b.row && Math.abs(a.col - b.col) === 1;

function getGroupStats(fences: Fence[]) {
  const rows = fences.map((it) => it.row);
  const cols = fences.map((it) => it.col);

  return {
    min: { row: Math.min(...rows), col: Math.min(...cols) },
    max: { row: Math.max(...rows), col: Math.max(...cols) },
    facing: fences[0].facing,
    isRow: rows.every((it) => it === rows[0]),
  };
}

function getFences(regionNodes: BoardNode<Plant>[]): Fence[] {
  return regionNodes.reduce<Fence[]>(
    (fences, { row, col, value, links: { U, D, L, R } }) => {
      if (!U || U.value !== value) fences.push({ row: row - 1, col, facing: "D" });
      if (!D || D.value !== value) fences.push({ row: row + 1, col, facing: "U" });
      if (!L || L.value !== value) fences.push({ row, col: col - 1, facing: "R" });
      if (!R || R.value !== value) fences.push({ row, col: col + 1, facing: "L" });
      return fences;
    },
    []
  );
}

function groupBySide(fences: Fence[]): FenceSide[] {
  const groups: Fence[][] = [];

  while (fences.length) {
    const start = fences.shift()!;
    const group = [start];

    let next = fences.find(
      (it) => isNextRow(it, start) || isNextCol(it, start)
    );

    while (next) {
      group.push(next);
      fences.splice(fences.indexOf(next), 1);

      const { min, max, facing, isRow } = getGroupStats(group);
      const { same, diff } = isRow
        ? ({ same: "row", diff: "col" } as const)
        : ({ same: "col", diff: "row" } as const);

      next = fences
        .filter((it) => it.facing === facing)
        .filter((it) => it[same] === min[same])
        .find((it) => it[diff] === min[diff] - 1 || it[diff] === max[diff] + 1);
    }

    groups.push(group);
  }

  return groups;
}

function toRegions(board: Board<Plant>): Region[] {
  const visited = new Set<BoardNode<Plant>>();

  return board.nodesList.reduce<Region[]>((regions, start) => {
    if (visited.has(start)) return regions;

    const group = new Set([start]);
    const value = start.value;
    const queue = start.getNeighborsMatching(value)

    while (queue.length) {
      const next = queue.shift();
      if (next && !group.has(next)) {
        group.add(next);
        queue.push(...next.getNeighborsMatching(value));
      }
    }

    group.forEach(visited.add.bind(visited));

    const nodes = [...group];
    const fences = getFences(nodes);
    const sides = groupBySide([...fences]);

    return [...regions, { nodes, fences, sides }];
  }, []);
}

function solve(input: string, item: "fences" | "sides"): number {
  const score = (region: Region) => region.nodes.length * region[item].length;
  return parse(input).transform(toRegions).map(score).reduce(sum);
}

export const solvePart1 = (input: string) => solve(input, "fences");
export const solvePart2 = (input: string) => solve(input, "sides");
