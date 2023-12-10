type Node = {
  row: number;
  col: number;
  value: string;
  connections: Node[];
  isWall?: boolean;
};

function parse(input: string): Node[][] {
  const cells = input.split("\n").map((row, rowIndex) => {
    return row.split("").map((value, colIndex): Node => {
      return {
        row: rowIndex,
        col: colIndex,
        value,
        connections: [],
        isWall: value === "S",
      };
    });
  });

  cells.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const { value } = cell;
      if (value === ".") return;
      const connections = [];

      if (value === "|") {
        const north = cells[rowIndex - 1]?.[colIndex];
        const south = cells[rowIndex + 1]?.[colIndex];
        cell.value = "┃";
        if (north) connections.push(north);
        if (south) connections.push(south);
      }

      if (value === "-") {
        const east = cells[rowIndex]?.[colIndex + 1];
        const west = cells[rowIndex]?.[colIndex - 1];
        cell.value = "━";
        if (east) connections.push(east);
        if (west) connections.push(west);
      }

      if (value === "L") {
        const north = cells[rowIndex - 1]?.[colIndex];
        const east = cells[rowIndex]?.[colIndex + 1];
        cell.value = "┗";
        if (north) connections.push(north);
        if (east) connections.push(east);
      }

      if (value === "J") {
        const north = cells[rowIndex - 1]?.[colIndex];
        const west = cells[rowIndex]?.[colIndex - 1];
        cell.value = "┛";
        if (north) connections.push(north);
        if (west) connections.push(west);
      }

      if (value === "7") {
        const south = cells[rowIndex + 1]?.[colIndex];
        const west = cells[rowIndex]?.[colIndex - 1];
        cell.value = "┓";
        if (south) connections.push(south);
        if (west) connections.push(west);
      }

      if (value === "F") {
        const south = cells[rowIndex + 1]?.[colIndex];
        const east = cells[rowIndex]?.[colIndex + 1];
        cell.value = "┏";
        if (south) connections.push(south);
        if (east) connections.push(east);
      }

      cell.connections = connections;
    });
  });

  return cells;
}

function print(cells: Node[][]) {
  console.log(
    cells
      .map((row) => {
        return row.map((cell) => cell.value).join("");
      })
      .join("\n")
  );
}

export function solvePart1(input: string): number {
  const data = parse(input);
  const cells = data.flat();
  const start = cells.find((cell) => cell.value === "S")!;

  const toVisit = cells.filter((cell) => cell.connections.includes(start));

  let prev = start;
  let current = toVisit[0];
  let steps = 1;
  while (current !== start) {
    const next = current.connections.find((cell) => cell !== prev)!;
    prev = current;
    current = next;
    steps += 1;
  }

  return steps / 2;
}
export function solvePart2(input: string): number {
  const data = parse(input);
  const cells = data.flat();
  const start = cells.find((cell) => cell.value === "S")!;

  const toVisit = cells.filter((cell) => cell.connections.includes(start));

  let prev = start;
  let current = toVisit[0];
  while (current !== start) {
    current.isWall = true;
    const next = current.connections.find((cell) => cell !== prev)!;
    prev = current;
    current = next;
  }

  cells.forEach((cell) => {
    if (!cell.isWall) {
      cell.value = ".";
    }
  });

  print(data);

  return 0;
}
