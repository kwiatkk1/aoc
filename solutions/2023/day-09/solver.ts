type Row = number[];
type AddFormula = (row: Row, nextAdded: number) => number;

function parse(input: string): Row[] {
  return input.split("\n").map((it) => it.split(" ").map((it) => parseInt(it)));
}

function getNextRow(row: Row): Row {
  const next = [];
  for (let i = 1; i < row.length; i++) {
    next.push(row[i] - row[i - 1]);
  }
  return next;
}

function solveRow(row: Row, addFormula: AddFormula): number {
  if (row.every((it) => it === 0)) return 0;

  const nextRow = getNextRow(row);
  const next = solveRow(nextRow, addFormula);

  return addFormula(row, next);
}

export function solve(input: string, addFormula: AddFormula): number {
  const data = parse(input);
  return data
    .map((it) => solveRow(it, addFormula))
    .reduce((sum, next) => sum + next, 0);
}

export function solvePart1(input: string): number {
  return solve(input, (row, next) => next + row[row.length - 1]);
}
export function solvePart2(input: string): number {
  return solve(input, (row, next) => row[0] - next);
}
