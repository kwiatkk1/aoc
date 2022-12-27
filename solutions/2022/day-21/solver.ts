type Operator = "+" | "-" | "*" | "/";
type Expression = { a: string; b: string; op: Operator };

class Monkey {
  constructor(
    public name: string,
    public value: number | null,
    public expression: Expression | null
  ) {}

  setOperation(operation: Operator) {
    if (this.expression) {
      this.expression.op = operation;
    }
    return this;
  }

  cloneWithConstantValue(value: number) {
    return new Monkey(this.name, value, null);
  }

  evaluate(monkeys: Monkey[]): number {
    const { value, expression } = this;

    if (value !== null) return value;

    if (expression) {
      const { a, b, op } = expression;
      const aValue = monkeys.find((it) => it.name === a)!.evaluate(monkeys);
      const bValue = monkeys.find((it) => it.name === b)!.evaluate(monkeys);

      if (op === "+") return aValue + bValue;
      if (op === "-") return aValue - bValue;
      if (op === "*") return aValue * bValue;
      if (op === "/") return aValue / bValue;
    }

    return 0;
  }

  static from(txt: string) {
    const [name, argsLine] = txt.split(": ");
    const args = argsLine.split(" ");
    const constValue = args.length === 1 ? parseInt(args[0]) : null;
    const expression =
      args.length === 3
        ? { a: args[0], b: args[2], op: args[1] as Operator }
        : null;

    return new Monkey(name, constValue, expression);
  }
}

function parse(input: string) {
  return input.split("\n").map((line) => Monkey.from(line));
}

export function solvePart1(input: string): number {
  const allMonkeys = parse(input);
  const rootMonkey = allMonkeys.find((it) => it.name === "root")!;
  return rootMonkey.evaluate(allMonkeys);
}

export function solvePart2(input: string): number {
  const allMonkeys = parse(input);
  const rootMonkey = allMonkeys.find((it) => it.name === "root")!;
  const startMonkey = allMonkeys.find((it) => it.name === "humn")!;
  const monkeys = allMonkeys.filter((it) => it.name !== startMonkey.name);

  rootMonkey.setOperation("-");

  let min = 0;
  let max = Number.MAX_SAFE_INTEGER;
  let current = min;

  while (true) {
    const toCheck = [...monkeys, startMonkey.cloneWithConstantValue(current)];
    const diff = rootMonkey.evaluate(toCheck);

    if (diff === 0) return current;
    if (diff > 0) [max, current] = [current, current - (max - min) / 2];
    if (diff < 0) [min, current] = [current, current + (max - min) / 2];
  }
}
