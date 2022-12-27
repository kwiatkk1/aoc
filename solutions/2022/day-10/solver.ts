import { parseInt } from "lodash";

type Command = "noop" | "addx";

class Computer {
  x: number = 1;
  cycle: number = 0;
  history: number[] = [];
  backlog: Record<number, number> = {};

  process(cmd: Command, value?: number) {
    this.cycle += 1;

    if (this.backlog[this.cycle]) {
      this.x += this.backlog[this.cycle];
    }

    if (cmd === "addx" && value) {
      this.backlog[this.cycle + 2] = value;
    }

    this.history[this.cycle] = this.x;

    if (cmd === "addx") this.process("noop");
  }

  print() {
      const history = this.history.slice(1);
      const chars: string[] = [];

      for (let i = 0; i < 240; i++) {
          if (i && i % 40 === 0) chars.push('\n');
          const positionSprite = [history[i] - 1, history[i], history[i] + 1];
          const positionDrawn = i % 40;

          chars.push(positionSprite.includes(positionDrawn) ? '#' : '.');
      }

      return chars.join('');
  }
}

function parse(input: string) {
  return input
    .split("\n")
    .map((line) => line.split(" "))
    .map(([command, valueText]) => {
      return {
        command: command as Command,
        value: parseInt(valueText),
      };
    });
}

export function solvePart1(input: string): number {
  const commands = parse(input);
  const computer = new Computer();

  for (let command of commands) {
    computer.process(command.command, command.value);
  }

  const result = [20, 60, 100, 140, 180, 220]
    .map((cycle) => {
      return cycle <= computer.history.length
        ? computer.history[cycle] * cycle
        : 0;
    })
    .reduce((sum, it) => sum + it, 0);

  return result;
}

export function solvePart2(input: string): string {
  const commands = parse(input);
  const computer = new Computer();

  for (let command of commands) {
    computer.process(command.command, command.value);
  }

  console.log(computer.print())

  return computer.print();
}
