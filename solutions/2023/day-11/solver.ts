type Node = {
  row: number;
  col: number;
  isGalaxy: boolean;
};

function parse(input: string): Node[][] {
  return input.split("\n").map((line, row) => {
    return line.split("").map((char, col) => {
      return {
        row,
        col,
        isGalaxy: char === "#",
      };
    });
  });
}

function pivotMatrix(data: Node[][]): Node[][] {
  const result: Node[][] = [];

  for (let col = 0; col < data[0].length; col++) {
    result.push([]);
    for (let row = 0; row < data.length; row++) {
      result[col].push(data[row][col]);
    }
  }

  return result;
}

function expand(data: Node[][], times = 2): Node[] {
  const pivoted = pivotMatrix(data);

  const rowsToExpand = data.flatMap((row, index) =>
    row.every((n) => !n.isGalaxy) ? [index] : []
  );

  const colsToExpand = pivoted.flatMap((row, index) =>
    row.every((n) => !n.isGalaxy) ? [index] : []
  );

  return data
    .flat()
    .filter((n) => n.isGalaxy)
    .map((n) => ({
      ...n,
      row:
        n.row + rowsToExpand.filter((row) => row < n.row).length * (times - 1),
      col:
        n.col + colsToExpand.filter((row) => row < n.col).length * (times - 1),
    }));
}

export function solvePart1(input: string, times = 2): number {
  const data = parse(input);
  const expanded = expand(data, times);

  let sum = 0;
  for (let i = 0; i < expanded.length - 1; i++) {
    const a = expanded[i];
    for (let j = i + 1; j < expanded.length; j++) {
      const b = expanded[j];
      const distance = Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
      sum += distance;
      // console.log("distance between", a, "and", b, ":", distance);
    }
  }

  return sum;
}
export function solvePart2(input: string): number {
  // console.log('10x', solvePart1(input, 10));
  // console.log('100x', solvePart1(input, 100));

  return solvePart1(input, 1e6);
}
