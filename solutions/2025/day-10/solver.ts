import { solve } from "yalps";

type Machine = {
  buttons: number[][];
  voltage: number[];
  pattern: number;
};

const sum = (sum: number, it: number) => sum + it;

function parse(input: string): Machine[] {
  return input.split("\n").map((line) => {
    const [required, ...buttons] = line.split(" ");
    const voltage = buttons.pop()!;

    return {
      pattern: required
        .substring(1, required.length - 1)
        .split("")
        .map((c) => (c == "." ? 0 : 1))
        .reduce((sum: number, n, i) => sum + Math.pow(2, i) * n, 0),
      buttons: buttons.map((btn) =>
        btn
          .substring(1, btn.length - 1)
          .split(",")
          .map(Number)
      ),
      voltage: voltage
        .substring(1, voltage.length - 1)
        .split(",")
        .map(Number),
    };
  });
}

function getMinPressesToPattern(m: Machine): number {
  const { pattern, buttons } = m;
  const results: boolean[][] = [];
  const pressed = buttons.map(() => false);
  const bValues = buttons.map((it) =>
    it.reduce((sum, n) => sum + Math.pow(2, n), 0)
  );

  const solve = (idx: number, target: number) => {
    if (target === 0) return results.push(pressed.slice());
    if (idx === buttons.length) return;

    pressed[idx] = true;
    solve(idx + 1, target ^ bValues[idx]);
    pressed[idx] = false;
    solve(idx + 1, target);
  };

  solve(0, pattern);

  return Math.min(
    ...results.map((res) => res.map((it) => (it ? 1 : 0)).reduce(sum, 0))
  );
}

function getMinPressesToVoltage(m: Machine): number {
  const { voltage, buttons } = m;
  const constraints = new Map();
  const variables = new Map();

  voltage.forEach((value, idx) => {
    constraints.set(`b${idx}`, { equal: value });
  });

  buttons.forEach((btn, btnIdx) =>
    variables.set(`x${btnIdx}`, {
      ...Object.fromEntries(
        voltage.map((_, idx) => [`b${idx}`, btn.includes(idx) ? 1 : 0])
      ),
      click: 1,
    })
  );

  return solve({
    direction: "minimize",
    objective: "click",
    constraints,
    variables,
    integers: true,
  })
    .variables.map(([_, value]) => value)
    .reduce(sum);
}

export function solvePart1(input: string): number {
  return parse(input).map(getMinPressesToPattern).reduce(sum);
}

export function solvePart2(input: string): number {
  return parse(input).map(getMinPressesToVoltage).reduce(sum);
}
