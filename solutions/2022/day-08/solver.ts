import { slice } from "lodash";

function parse(input: string) {
  return input
    .split("\n")
    .map((row) =>
      row.split("").map((n) => ({ visible: false, height: parseInt(n) }))
    );
}

function getColumns<T>(map: T[][]) {
  const columns = [];

  for (let i = 0; i < map[0].length; i++) {
    columns[i] = map.map((row) => row[i]);
  }

  return columns;
}

export function solvePart1(input: string): number {
  const map = parse(input);

  map.forEach((row, rowIndex) => {
    let maxRowForward = -1;
    row.forEach((cell, colIndex) => {
      if (cell.height > maxRowForward) {
        cell.visible = true;
        maxRowForward = cell.height;
      }
    });
    let maxRowReverse = -1;
    [...row].reverse().forEach((cell, colIndex) => {
      if (cell.height > maxRowReverse) {
        cell.visible = true;
        maxRowReverse = cell.height;
      }
    });
  });

  const mapPivoted = getColumns(map);

  mapPivoted.forEach((row) => {
    let maxRowForward = -1;
    row.forEach((cell, colIndex) => {
      if (cell.height > maxRowForward) {
        cell.visible = true;
        maxRowForward = cell.height;
      }
    });
    let maxRowReverse = -1;
    [...row].reverse().forEach((cell) => {
      if (cell.height > maxRowReverse) {
        cell.visible = true;
        maxRowReverse = cell.height;
      }
    });
  });

  return map.flat().reduce((acc, { visible }) => acc + (visible ? 1 : 0), 0);
}

function getViewDistance(current: number, trees: { height: number }[]): number {
  let distance = 0;
  for (let i = 0; i < trees.length; i++) {
    distance += 1;
    if (trees[i].height >= current) break;
  }
  return distance;
}

function getScore(
  map: { height: number }[][],
  { x, y }: { x: number; y: number }
) {
  const row = map[x];
  const column = getColumns(map)[y];
  const base = map[x][y].height;

  const toLeft = row.slice(0, y).reverse();
  const toRight = row.slice(y+1);
  const toUp = column.slice(0, x).reverse();
  const toDown = column.slice(x+1);
  //
  // console.log({ x, y });
  // console.log({ toLeft, toRight, toUp, toDown });

  return [toLeft, toRight, toUp, toDown]
    .map((trees) => getViewDistance(base, trees))
    .reduce((mul, score) => mul * score);
}

export function solvePart2(input: string): number {
  const map = parse(input);
  const scores: number[][] = [];

  for (let i = 0; i < map.length; i++) {
    scores[i] = [];
    for (let j = 0; j < map.length; j++) {
      scores[i][j] = getScore(map, { x: i, y: j });
    }
  }
  return Math.max(...scores.flat());
}
