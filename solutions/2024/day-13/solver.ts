type Machine = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  px: number;
  py: number;
};

const sum = (a: number, b: number) => a + b;

function parse(input: string): Machine[] {
  const groups = input.split("\n\n");
  return groups.map((group) => {
    const [linea, lineb, linep] = group.split("\n");
    const [ax, ay] = /(\d+), Y\+(\d+)/g.exec(linea)!.slice(1).map(Number);
    const [bx, by] = /(\d+), Y\+(\d+)/g.exec(lineb)!.slice(1).map(Number);
    const [px, py] = /(\d+), Y=(\d+)/g.exec(linep)!.slice(1).map(Number);
    return { ax, ay, bx, by, px, py };
  });
}

function getMinTokensSimulate(machine: Machine): number {
  let max = 100;
  let min = Infinity;

  for (let i = 0; i <= max; i++) {
    for (let j = 0; j <= max; j++) {
      const x = i * machine.ax + j * machine.bx;
      const y = i * machine.ay + j * machine.by;
      if (x === machine.px && y === machine.py) {
        min = Math.min(min, i * 3 + j);
      }
    }
  }

  return isFinite(min) ? min : 0;
}

function getMinTokensCalculate(machine: Machine): number {
  const { ax, ay, bx, by, px, py } = machine;

  // na * ax + nb * bx = px
  // na * ay + nb * by = py

  // na = (px - nb * bx) / ax
  // na = (py - nb * by) / ay
  // (px - nb * bx) / ax = (py - nb * by) / ay
  // (px - nb * bx) * ay = (py - nb * by) * ax
  // ay * px - nb * ay * bx = ax * py - nb * ax * by
  // nb * ax * by - nb * ay * bx = ax * py - ay * px
  // nb = (ax * py - ay * px) / (ax * by - ay * bx)
  const nb = (ax * py - ay * px) / (ax * by - ay * bx);

  // nb = (px - na * ax) / bx
  // nb = (py - na * ay) / by
  // (px - na * ax) / bx = (py - na * ay) / by
  // (px - na * ax) * by = (py - na * ay) * bx
  // by * px - na * by * ax = bx * py - na * bx * ay
  // na * bx * ay - na * by * ax = bx * py - by * px
  // na = (by * px - bx * py) / (ax * by - ay * bx)
  const na = (by * px - bx * py) / (ax * by - ay * bx);

  if (na % 1 || nb % 1) return 0;

  return na * 3 + nb;
}

export function solvePart1(input: string): number {
  return parse(input).map(getMinTokensSimulate).reduce(sum);
}
export function solvePart2(input: string): number {
  const machines = parse(input);
  const offset = 10e12;

  return machines
    .map((it) => ({
      ...it,
      px: it.px + offset,
      py: it.py + offset,
    }))
    .map(getMinTokensCalculate)
    .reduce(sum);
}
