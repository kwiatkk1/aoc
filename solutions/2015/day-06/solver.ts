type Point = { row: number; col: number };
type Command = {
  func: (light: Light) => any;
  from: Point;
  to: Point;
};
type Light = Point & { on: boolean; brightness: number };

function getLights(size: number) {
  const lights: Light[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      lights.push({ row, col, on: false, brightness: 0 });
    }
  }
  return lights;
}

const turnOn = (light: Light) => {
  light.on = true;
  light.brightness++;
};
const turnOff = (light: Light) => {
  light.on = false;
  light.brightness = Math.max(0, light.brightness - 1);
};
const toggle = (light: Light) => {
  light.on = !light.on;
  light.brightness += 2;
};

function parse(input: string): Command[] {
  return input.split("\n").map((line) => {
    const numbers = line.match(/(\d+)/g)!.map((it) => Number(it));
    const func = line.startsWith("turn on")
      ? turnOn
      : line.startsWith("turn off")
      ? turnOff
      : toggle;

    return {
      func,
      from: { row: numbers[0], col: numbers[1] },
      to: { row: numbers[2], col: numbers[3] },
    };
  });
}

function solve(input: string): Light[] {
  const lights = getLights(1000);
  const commands = parse(input);

  for (const command of commands) {
    for (const light of lights) {
      if (
        light.row >= command.from.row &&
        light.row <= command.to.row &&
        light.col >= command.from.col &&
        light.col <= command.to.col
      ) {
        command.func(light);
      }
    }
  }

  return lights;
}

export function solvePart1(input: string): number {
  return solve(input).filter(({ on }) => on).length;
}
export function solvePart2(input: string): number {
  return solve(input).reduce((total, { brightness }) => total + brightness, 0);
}
