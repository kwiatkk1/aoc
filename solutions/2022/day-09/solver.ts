import { parseInt } from "lodash";

type Direction = "R" | "L" | "D" | "U";

const step = {
  R: { x: +1, y: 0 },
  L: { x: -1, y: 0 },
  D: { x: 0, y: -1 },
  U: { x: 0, y: +1 },
};

class Game {
  minX = 0;
  maxX = 0;
  minY = 0;
  maxY = 0;
  head = { x: 0, y: 0 };
  tail = { x: 0, y: 0 };

  history = [{ x: 0, y: 0 }];

  step(direction: Direction) {
    const headMove = step[direction];

    this.head.x += headMove.x;
    this.head.y += headMove.y;

    // min/max
    if (this.minX > this.head.x) this.minX = this.head.x;
    if (this.maxX < this.head.x) this.maxX = this.head.x;
    if (this.minY > this.head.y) this.minY = this.head.y;
    if (this.maxY < this.head.y) this.maxY = this.head.y;

    // tail
    const xDiff = this.head.x - this.tail.x;
    const yDiff = this.head.y - this.tail.y;

    if (Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1) {
      if (xDiff) this.tail.x += xDiff > 0 ? 1 : -1;
      if (yDiff) this.tail.y += yDiff > 0 ? 1 : -1;

      this.history.push({ ...this.tail });
    }

    // console.log("after step", direction, "H", this.head, "T", this.tail);
  }

  process(direction: Direction, steps: number) {
    for (let i = 0; i < steps; i++) {
      this.step(direction);
    }
  }
}

class Game2 {
  minX = 0;
  maxX = 0;
  minY = 0;
  maxY = 0;
  head = { x: 0, y: 0 };
  tails = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];

  history = [{ x: 0, y: 0 }];

  move(h: { x: number; y: number }, t: { x: number; y: number }) {
    const xDiff = h.x - t.x;
    const yDiff = h.y - t.y;

    if (Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1) {
      if (xDiff) t.x += xDiff > 0 ? 1 : -1;
      if (yDiff) t.y += yDiff > 0 ? 1 : -1;
    }

    return t;
  }

  step(direction: Direction) {
    const headMove = step[direction];

    this.head.x += headMove.x;
    this.head.y += headMove.y;

    // min/max
    if (this.minX > this.head.x) this.minX = this.head.x;
    if (this.maxX < this.head.x) this.maxX = this.head.x;
    if (this.minY > this.head.y) this.minY = this.head.y;
    if (this.maxY < this.head.y) this.maxY = this.head.y;

    this.move(this.head, this.tails[0]);

    for (let i = 1; i < this.tails.length; i++) {
      this.move(this.tails[i - 1], this.tails[i]);
    }

    this.history.push({ ...this.tails[8] });

    // console.log("after step", direction, "H", this.head, "T", this.tail);
  }

  process(direction: Direction, steps: number) {
    for (let i = 0; i < steps; i++) {
      this.step(direction);
    }
  }
}

function parse(input: string) {
  return input.split("\n").map((line) => {
    const [direction, steps] = line.split(" ");
    return { direction: direction as Direction, steps: parseInt(steps) };
  });
}

export function solvePart1(input: string): number {
  const commands = parse(input);
  const game = new Game();

  commands.forEach((cmd) => game.process(cmd.direction, cmd.steps));

  const visited = new Set(game.history.map((it) => `${it.x}|${it.y}`));

  return visited.size;
}

export function solvePart2(input: string): number {
  const commands = parse(input);
  const game = new Game2();

  commands.forEach((cmd) => game.process(cmd.direction, cmd.steps));

  const visited = new Set(game.history.map((it) => `${it.x}|${it.y}`));

  return visited.size;
}
