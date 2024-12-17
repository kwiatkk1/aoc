import {progressLogger} from "../../../utils/debug";

type Registers = "A" | "B" | "C";

class Comp {
  pointer = 0;
  register: Record<Registers, number> = {
    A: 0,
    B: 0,
    C: 0,
  };
  commands: number[] = [];
  output: number[] = [];

  constructor(registers: Record<Registers, number>, commands: number[]) {
    this.register = registers;
    this.commands = commands;
  }

  reset(A: number, B: number, C: number) {
    this.pointer = 0;
    this.register = { A, B, C };
    this.output = [];
  }

  printState() {
    const { A, B, C } = this.register;
    console.log("State", "A", A, "B", B, "C", C, "Pointer:", this.pointer);
  }

  run() {
    while (this.runNext()) {}
  }

  runToMatch() {
    const expected = this.commands.join(",");

    while (this.runNext()) {
      if (!expected.startsWith(this.output.join(","))) {
        return;
      }
    }
  }

  runNext() {
    const cmd = this.commands[this.pointer];
    const op = this.commands[this.pointer + 1];
    this.pointer += 2;

    if (typeof op === "undefined") {
      return false;
    }

    // console.log("Executing", `${cmd}, op: ${op}`);
    // this.printState();

    switch (cmd) {
      case 0:
        this.adv(op);
        break;
      case 1:
        this.bxl(op);
        break;
      case 2:
        this.bst(op);
        break;
      case 3:
        this.jnz(op);
        break;
      case 4:
        this.bxc();
        break;
      case 5:
        this.out(op);
        break;
      case 6:
        this.bdv(op);
        break;
      case 7:
        this.cdv(op);
        break;
      default:
        console.log(
          "Invalid command",
          `${cmd}, op: ${op}, pointer: ${this.pointer}`,
          this.commands
        );
        process.exit(-1);
    }

    // console.log("After", `${JSON.stringify(this.register)}, pointer: ${this.pointer}`);

    return true;
  }

  getCombo(combo: number) {
    if (combo < 4) return combo;
    if (combo === 4) return this.register.A;
    if (combo === 5) return this.register.B;
    if (combo === 6) return this.register.C;
    console.log("Invalid combo");
    return -1;
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
    this.register.B = value % 8;
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
    this.output.push(value % 8);
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
  const start = 1_000_000_000;
  const end = 100_000_000_000;

  let initial = start;

  while (initial < end) {
    computer.reset(initial, 0, 0);
    computer.runToMatch();

    progressLogger.print(`${initial} ${((initial - start) / (end - start) * 100).toFixed(2)}%`);

    if (computer.output.join(",") === computer.commands.join(",")) {
      return initial;
    }
    initial += 1;
  }

  return -1;
}
