const mul = (a: number, b: number) => a * b;
const sum = (a: number, b: number) => a + b;

type Problem = {
  values: number[];
  opFunc: (a: number, b: number) => number;
};

function solve(problems: Problem[]) {
  return problems
    .map((problem) => problem.values.reduce(problem.opFunc))
    .reduce(sum);
}

export function solvePart1(input: string): number {
  const problems: Problem[] = [];
  const rows = input
    .split("\n")
    .map((line) => line.split(" ").filter((it) => it !== ""));

  for (let x = 0; x < rows[0].length; x++) {
    const opFunc = rows[rows.length - 1][x] === "*" ? mul : sum;
    const values = rows
      .slice(0, rows.length - 1)
      .map((row) => row[x])
      .map(Number);

    problems.push({ values, opFunc });
  }

  return solve(problems);
}

export function solvePart2(input: string): number {
  const problems: Problem[] = [];
  const rows = input.split("\n");

  let opFunc = sum;
  let values: number[] = [];

  for (let x = 0; x < rows[0].length; x++) {
    const number = rows
      .slice(0, rows.length - 1)
      .map((it) => it[x])
      .join("");
    const value = parseInt(number, 10);

    if (rows[rows.length - 1][x] !== " ") {
      opFunc = rows[rows.length - 1][x] === "*" ? mul : sum;
    }

    if (!isNaN(value)) {
      values.push(value);
    } else {
      problems.push({ values, opFunc });
      values = [];
    }
  }
  problems.push({ values, opFunc });

  return solve(problems);
}
