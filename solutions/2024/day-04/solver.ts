function parse(input: string): string[][] {
  return input.split("\n").map((row) => row.split(""));
}

export function solvePart1(input: string): number {
  const data = parse(input);

  const linesH = data.map((row) => row.join(""));
  const linesV = data[0].map((_, i) => data.map((row) => row[i]).join(""));
  const linesD = [];

  for (let i = 0; i < data[0].length; i++) {
    let rowU = "";
    let rowD = "";
    for (let j = 0; j < data.length; j++) {
      rowU += data[j][i + j] || "";
      rowD += data[j][j - i - 1] || "";
    }
    linesD.push(rowU);
    linesD.push(rowD);
  }

  for (let i = data[0].length - 1; i >= 0; i--) {
    let rowU = "";
    let rowD = "";
    for (let j = data.length - 1; j >= 0; j--) {
      rowU += data[j][i + data.length - 1 - j] || "";
      rowD += data[j][i - j - 1] || "";
    }
    linesD.push(rowU);
    linesD.push(rowD);
  }

  return [linesH, linesV, linesD]
    .flatMap((it) => [it, it.map((x) => x.split("").reverse().join(""))])
    .flat()
    .map((line) => line.split("XMAS").length - 1)
    .reduce((acc, count) => acc + count);
}

export function solvePart2(input: string): number {
  const data = parse(input);
  const patterns = [
    [
      ["M", ".", "S"],
      [".", "A", "."],
      ["M", ".", "S"],
    ],
    [
      ["S", ".", "M"],
      [".", "A", "."],
      ["S", ".", "M"],
    ],
    [
      ["M", ".", "M"],
      [".", "A", "."],
      ["S", ".", "S"],
    ],
    [
      ["S", ".", "S"],
      [".", "A", "."],
      ["M", ".", "M"],
    ],
  ];

  const isMatchAt = (row: number, col: number) => (pattern: string[][]) =>
    pattern.every((line, i) =>
      line.every((cell, j) => cell === "." || cell === data[row + i][col + j])
    );

  let count = 0;
  for (let i = 0; i < data.length - 2; i++) {
    for (let j = 0; j < data[0].length - 2; j++) {
      count += patterns.filter(isMatchAt(i, j)).length;
    }
  }

  return count;
}
