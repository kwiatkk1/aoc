import { Board, BoardNode } from "../../../utils/board";

type Hill = number;

function parse(input: string) {
  return Board.from<Hill>(input, ({ char }) => parseInt(char));
}

const sum = (a: number, b: number) => a + b;
const uniq = <T>(elements: T[]) => [...new Set(elements)];

function getTrailsFrom(start: BoardNode<Hill>): BoardNode<Hill>[][] {
  const paths = [];
  const queue = [{ path: [start] }];

  while (queue.length > 0) {
    const { path } = queue.shift()!;
    const node = path[path.length - 1];

    if (node.value === 9) {
      paths.push(path);
    }

    Object.values(node.links)
      .flatMap((it) => (it ? [it.node] : []))
      .filter((it) => it.value === node.value + 1)
      .forEach((it) => queue.push({ path: [...path, it] }));
  }

  return paths;
}

export function solvePart1(input: string): number {
  const trailheads = parse(input).filter((it) => it.value === 0);
  const score = (paths: BoardNode<Hill>[][]) =>
    uniq(paths.map((path) => path[path.length - 1])).length;

  return trailheads.map(getTrailsFrom).map(score).reduce(sum);
}
export function solvePart2(input: string): number {
  const trailheads = parse(input).filter((it) => it.value === 0);
  const rank = (paths: BoardNode<Hill>[][]) => paths.length;

  return trailheads.map(getTrailsFrom).map(rank).reduce(sum);
}
