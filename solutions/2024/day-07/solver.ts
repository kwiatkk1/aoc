function parse(input: string) {
  return input.split("\n").map((line) => {
    const [expected, values] = line.split(":");
    return {
      expected: parseInt(expected),
      values: values
        .trim()
        .split(" ")
        .map((value) => parseInt(value)),
    };
  });
}

type Operation = (a: number, b: number) => number;

const add: Operation = (a: number, b: number) => a + b;
const mul: Operation = (a: number, b: number) => a * b;
const con: Operation = (a: number, b: number) => parseInt(`${a}${b}`);

function getValidator(operations: Operation[]) {
  return function validator({
    expected,
    values,
  }: {
    expected: number;
    values: number[];
  }): boolean {
    if (values.length === 1 && values[0] === expected) return true;

    const results = operations.map((op) => op(values[0], values[1]));

    if (values.length === 2) {
      return results.some((it) => it === expected);
    }

    return results.some((it) => {
      return (
        it <= expected &&
        validator({ expected, values: [it, ...values.slice(2)] })
      );
    });
  };
}

function solve(input: string, operations: Operation[]): number {
  const equations = parse(input);
  const isValid = getValidator(operations);

  return equations
    .filter(isValid)
    .reduce((acc, { expected }) => acc + expected, 0);
}

export function solvePart1(input: string, operations = [add, mul]): number {
  return solve(input, [add, mul]);
}
export function solvePart2(input: string): number {
  return solve(input, [add, mul, con]);
}
