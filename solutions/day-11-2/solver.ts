import { parseInt } from "lodash";

class Monkey {
  inspectsCount = 0;
  constructor(
    public name: number,
    public items: number[],
    public operation: string[],
    public test: number,
    public trueBranch: number,
    public falseBranch: number
  ) {}

  /**
   * Monkey 0:
   *   Starting items: 79, 98
   *   Operation: new = old * 19
   *   Test: divisible by 23
   *     If true: throw to monkey 2
   *     If false: throw to monkey 3
   */
  static parse(text: string): Monkey {
    const [nameLine, itemsLine, opsLine, testLine, trueLine, falseLine] =
      text.split("\n");

    const name = parseInt(nameLine.substring(7, 8));
    const items = itemsLine
      .substring(18)
      .split(", ")
      .map((it) => parseInt(it));
    const operation = opsLine.substring(23).split(" ");
    const test = parseInt(testLine.substring(21));
    const trueBranch = parseInt(trueLine.substring(29));
    const falseBranch = parseInt(falseLine.substring(30));

    return new Monkey(name, items, operation, test, trueBranch, falseBranch);
  }

  processItem(value: number, nwd: number): { item: number; toMonkey: number } {
    this.inspectsCount += 1;
    const [operator, operandText] = this.operation;
    const operand = operandText === "old" ? value : parseInt(operandText);

    // 1. process
    if (operator === "+") {
      value = value + operand;
    } else if (operator === "*") {
      value = value * operand;
    }

    // 2. bored factor
    // value = Math.floor(value / 3);
    // 2. bored factor
    value = value % nwd;

    // 3. test
    if (value % this.test === 0) {
      return { item: value, toMonkey: this.trueBranch };
    }
    return { item: value, toMonkey: this.falseBranch };
  }

  makeTurn(monkeys: Monkey[]) {
    const nwd = monkeys.reduce((acc, m) => acc * m.test, 1);
    [...this.items].forEach((value) => {
      const { toMonkey, item } = this.processItem(value, nwd);
      const target = monkeys.find(({ name }) => name === toMonkey);
      if (target) target.items.push(item);
    });
    this.items = [];
  }
}

function parse(input: string): Monkey[] {
  return input.split("\n\n").map((it) => Monkey.parse(it));
}

function round(monkeys: Monkey[]) {
  monkeys.forEach((monkey) => monkey.makeTurn(monkeys));
}

export function solvePart1(input: string): number {
  const monkeys = parse(input);

  for (let i = 0; i < 20; i++) {
    //console.log("round", i);
    round(monkeys);
    //console.log(monkeys.map(m => `${m.name}: ${m.items.join(", ")}`).join('\n'));
  }

  // console.log(monkeys.map(m => `${m.name}: ${m.inspectsCount}`).join('\n'));

  const [a, b] = monkeys.map((m) => m.inspectsCount).sort((a, b) => b - a);
  const monkeyBusiness = a * b;

  return monkeyBusiness;
}

export function solvePart2(input: string): number {
  const monkeys = parse(input);

  for (let i = 0; i < 10000; i++) {
    round(monkeys);
  }

  const [a, b] = monkeys.map((m) => m.inspectsCount).sort((a, b) => b - a);
  const monkeyBusiness = a * b;

  return monkeyBusiness;
}
