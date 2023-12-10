type Node = {
  row: number;
  col: number;
  value: string;
  connectsE?: boolean;
  connectsW?: boolean;
  connectsN?: boolean;
  connectsS?: boolean;
  connections: Node[];
  isWall?: boolean;
  isExtended?: boolean;
};

const symbols: Record<string, Partial<Node>> = {
  ".": { value: "·" },
  "|": { value: "┃", connectsN: true, connectsS: true },
  "-": { value: "━", connectsE: true, connectsW: true },
  L: { value: "┗", connectsN: true, connectsE: true },
  J: { value: "┛", connectsN: true, connectsW: true },
  "7": { value: "┓", connectsS: true, connectsW: true },
  F: { value: "┏", connectsS: true, connectsE: true },
};

function parse(input: string): Node[][] {
  const rows = input.split("\n").map((rowString, rowIndex) =>
    rowString.split("").map(
      (value, colIndex): Node => ({
        row: rowIndex,
        col: colIndex,
        value,
        connections: [],
        isWall: value === "S",
      })
    )
  );

  rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const { value } = cell;
      Object.assign(cell, symbols[value]);

      const cellN = rows[rowIndex - 1]?.[colIndex];
      const cellS = rows[rowIndex + 1]?.[colIndex];
      const cellE = row[colIndex + 1];
      const cellW = row[colIndex - 1];

      if (cell.connectsN && cellN) cell.connections.push(cellN);
      if (cell.connectsS && cellS) cell.connections.push(cellS);
      if (cell.connectsE && cellE) cell.connections.push(cellE);
      if (cell.connectsW && cellW) cell.connections.push(cellW);
    });
  });

  return rows;
}

function getNewCell(isWall = false): Node {
  return {
    row: 0,
    col: 0,
    value: isWall ? "x" : " ",
    connections: [],
    isExtended: true,
    isWall: isWall,
  };
}

function debugPrint(cells: Node[][]) {
  const output = cells
    .map((row) => row.map(({ value }) => value).join(""))
    .join("\n");
  console.log(output);
}

function markWall(data: Node[][]) {
  const cells = data.flat();
  const start = cells.find((cell) => cell.value === "S")!;
  const [toVisit] = cells.filter((cell) => cell.connections.includes(start));
  let [prev, current] = [start, toVisit];

  while (current !== start) {
    current.isWall = true;
    const next = current.connections.find((cell) => cell !== prev)!;
    [prev, current] = [current, next];
  }
}

function clearNotWall(data: Node[][]) {
  data.flat().forEach((cell) => {
    if (!cell.isWall) {
      cell.value = "·";
      cell.connections = [];
    }
  });

  return data;
}

function zoomMapIn(data: Node[][]): Node[][] {
  // adds extra column to the right of each cell
  let rows = data.map((row, rowIndex) => {
    return row.flatMap((cell, colIndex) => {
      const nextCell = row[colIndex + 1];
      const isExtraWall =
        (cell.isWall && cell.connectsE) ||
        (nextCell?.isWall && nextCell?.connectsW);

      return [cell, getNewCell(isExtraWall)];
    });
  });

  // adds extra row below each cell
  rows = rows.flatMap((row, rowIndex, rows) => {
    const extraRow = row.map<Node>((cell, col) => {
      const nextCell = rows[rowIndex + 1]?.[col];
      const isExtraWall =
        (cell.isWall && cell.connectsS) ||
        (nextCell?.isWall && nextCell?.connectsN);

      return getNewCell(isExtraWall);
    });

    return [row, extraRow];
  });

  // adds extra column at start and end of each row
  rows = rows.map((row, rowIndex) => [getNewCell(), ...row, getNewCell()]);

  // adds extra row at start and end of the map
  rows = [
    rows[0].map(() => getNewCell()),
    ...rows,
    rows[0].map(() => getNewCell()),
  ];

  // update coordinates
  rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      cell.row = rowIndex;
      cell.col = colIndex;
    });
  });

  return rows;
}

export function solvePart1(input: string): number {
  const rows = parse(input);
  markWall(rows);
  const wallLength = rows.flat().filter((cell) => cell.isWall).length;

  return wallLength / 2;
}

export function solvePart2(input: string): number {
  const data = parse(input);

  markWall(data);
  clearNotWall(data);

  const extended = zoomMapIn(data);

  // debugPrint(extended);

  let extendedCells = extended.flat();
  let toVisit = [extended[0][0]];
  let visited = new Set<Node>();

  while (toVisit.length) {
    const current = toVisit.shift()!;

    if (visited.has(current)) continue;
    visited.add(current);

    const { row, col } = current;
    const toN = extended[row - 1]?.[col];
    const toS = extended[row + 1]?.[col];
    const toE = extended[row]?.[col + 1];
    const toW = extended[row]?.[col - 1];

    if (toN && !toN.isWall && !visited.has(toN)) toVisit.push(toN);
    if (toS && !toS.isWall && !visited.has(toS)) toVisit.push(toS);
    if (toE && !toE.isWall && !visited.has(toE)) toVisit.push(toE);
    if (toW && !toW.isWall && !visited.has(toW)) toVisit.push(toW);
  }

  const notVisited = extendedCells.filter(
    (cell) => !cell.isWall && !cell.isExtended && !visited.has(cell)
  );

  return notVisited.length;
}
