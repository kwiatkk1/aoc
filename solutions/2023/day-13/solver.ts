type Pattern = string[][];
type Symmetry = { row: number[]; col: number[] };

function parse(input: string): Pattern[] {
  return input
    .split("\n\n")
    .map((it) => it.split("\n").map((row) => row.split("")));
}

function print(pattern: Pattern) {
  const toPrint = pattern.map((row) => row.join("")).join("\n");
  console.log(toPrint);
}

function copyAndOverrideInPattern(
  pattern: Pattern,
  row: number,
  col: number
): Pattern {
  const result = pattern.map((rows) => [...rows.map((it) => it)]);
  result[row][col] = result[row][col] === "." ? "#" : ".";
  return result;
}

const cache = new Map<string, number[]>();

function findSymmetryInLine(line: string[]): number[] {
  const result = [];
  const length = line.length;
  const key = line.join("");

  if (cache.has(key)) {
    return cache.get(key)!;
  }

  // find symmetry forward
  for (let i = 1; i < length / 2; i++) {
    if (
      line.slice(0, i).join("") ===
      line
        .slice(i, 2 * i)
        .reverse()
        .join("")
    ) {
      result.push(i);
    }
  }

  // find symmetry backward
  for (let i = 1; i < length / 2; i++) {
    if (
      line
        .slice(length - i, length)
        .reverse()
        .join("") === line.slice(length - 2 * i, length - i).join("")
    ) {
      result.push(length - i);
    }
  }

  cache.set(key, result);
  return result;
}

function rotateLeft(pattern: Pattern): Pattern {
  const result: Pattern = [];
  const rowsCount = pattern.length;
  const colsCount = pattern[0].length;

  for (let col = 0; col < colsCount; col++) {
    const current: string[] = [];
    for (let row = 0; row < rowsCount; row++) {
      current.push(pattern[row][colsCount - 1 - col]);
    }
    result.push(current);
  }

  return result;
}

function intersect(a: number[], b: number[]): number[] {
  return a.filter((it) => b.includes(it));
}

function findSymmetry(pattern: Pattern): Symmetry {
  const rotated = rotateLeft(pattern);

  const [col0, ...colsRest] = pattern.map(findSymmetryInLine);
  const [row0, ...rowsRest] = rotated.map(findSymmetryInLine);

  return {
    row: rowsRest.reduce(intersect, row0),
    col: colsRest.reduce(intersect, col0),
  };
}

function accumulateScore(acc: number, { row, col }: Symmetry): number {
  return acc + (col[0] || 0) + 100 * (row[0] || 0);
}

export function solvePart1(input: string): number {
  return parse(input).map(findSymmetry).reduce(accumulateScore, 0);
}
export function solvePart2(input: string): number {
  return parse(input)
    .map((it) => {
      const base = findSymmetry(it);

      for (let i = 0; i < it.length; i++) {
        for (let j = 0; j < it[0].length; j++) {
          const flipped = copyAndOverrideInPattern(it, i, j);
          const next = findSymmetry(flipped);

          // same symmetry
          if (JSON.stringify(base) === JSON.stringify(next)) {
            continue;
          }

          // has new symmetry
          const newRowSymmetry = next.row.find((it) => !base.row.includes(it));
          const newColSymmetry = next.col.find((it) => !base.col.includes(it));

          if (newRowSymmetry) {
            return { row: [newRowSymmetry], col: [] };
          }
          if (newColSymmetry) {
            return { col: [newColSymmetry], row: [] };
          }
        }
      }

      return base;
    })
    .reduce(accumulateScore, 0);
}
