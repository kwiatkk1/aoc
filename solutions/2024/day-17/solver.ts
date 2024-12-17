type Registers = "A" | "B" | "C";

class Comp {
  pointer = 0;
  register: Record<Registers, number> = {
    A: 0,
    B: 0,
    C: 0,
  };
  inputs: number[] = [];
  output: number[] = [];
  commands = ["adv", "bxl", "bst", "jnz", "bxc", "out", "bdv", "cdv"] as const;

  constructor(registers: Record<Registers, number>, commands: number[]) {
    this.register = registers;
    this.inputs = commands;
  }

  reset(A: number, B: number, C: number) {
    this.pointer = 0;
    this.register = { A, B, C };
    this.output = [];
  }

  run() {
    while (this.runNext()) {}
  }

  runNext() {
    const cmdCode = this.inputs[this.pointer];
    const op = this.inputs[this.pointer + 1];
    this.pointer += 2;
    if (typeof op === "undefined") return false;
    const command = this.commands[cmdCode];
    if (command) this[command](op);
    return true;
  }

  getCombo(combo: number) {
    if (combo < 4) return combo;
    if (combo === 4) return this.register.A;
    if (combo === 5) return this.register.B;
    if (combo === 6) return this.register.C;
    process.exit(1);
  }

  adv(combo: number) {
    const value = this.getCombo(combo);
    this.register.A = Math.floor(this.register.A / Math.pow(2, value));
  }

  bxl(value: number) {
    this.register.B = this.register.B ^ value;
  }

  bst(combo: number) {
    const value = this.getCombo(combo);
    this.register.B = value & 7;
  }

  jnz(value: number) {
    if (this.register.A !== 0) {
      this.pointer = value;
    }
  }

  bxc() {
    this.register.B = this.register.B ^ this.register.C;
  }

  out(combo: number) {
    const value = this.getCombo(combo);
    this.output.push(value & 7);
  }

  bdv(combo: number) {
    const value = this.getCombo(combo);
    this.register.B = Math.floor(this.register.A / Math.pow(2, value));
  }

  cdv(combo: number) {
    const value = this.getCombo(combo);
    this.register.C = Math.floor(this.register.A / Math.pow(2, value));
  }
}

function parse(input: string) {
  const [reg, cmd] = input.split("\n\n");
  const registers = Object.fromEntries(
    reg.split("\n").map((line) => {
      const [_, register, value] = line.split(/:? /);
      return [register, Number(value)];
    })
  ) as unknown as Record<Registers, number>;

  const commands = cmd.split(": ")[1].split(",").map(Number);
  return new Comp(registers, commands);
}

export function solvePart1(input: string) {
  const computer = parse(input);
  computer.run();
  return computer.output.join(",");
}

export function solvePart2(input: string): number {
  const computer = parse(input);
  const end = parseInt("7777777777777777", 8);
  let start = 0;

  const cn = computer.inputs.length;
  const prefixes: Set<string>[] = computer.inputs.map(() => new Set<string>());

  while (start < end) {
    computer.reset(start, 0, 0);
    computer.run();

    const n = computer.output.length;

    if (cn < n) {
      return -1;
    }

    for (let i = 0; i < n; i++) {
      if (computer.output[n - i - 1] === computer.inputs[cn - i - 1]) {
        prefixes[i].add(start.toString(8).substring(0, i + 1));
      }
    }

    if (computer.output.join(",") === computer.inputs.join(",")) {
      return start;
    }

    const startLength = start.toString(8).length;
    const prefixesToCheck = prefixes.slice(0, startLength - 1);
    const effective = [...(prefixesToCheck[prefixesToCheck.length - 1] || [])];

    if (
      !effective.length ||
      effective.some((prefix) => start.toString(8).startsWith(prefix))
    ) {
      start += 1;
      continue;
    }

    while (!effective.some((prefix) => start.toString(8).startsWith(prefix))) {
      const rangeStarts = effective.map((prefix) => `${prefix}0`).sort();
      const nextStart = rangeStarts.find((range) => range >= start.toString(8));
      start = nextStart ? parseInt(nextStart, 8) : parseInt(`${rangeStarts[0]}0`, 8);
    }
  }

  return -1;
}
