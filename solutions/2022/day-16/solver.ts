class Valve {
  isOpen: boolean = false;
  distance: Record<string, number> = {};
  valves: Valve[] = [];
  constructor(
    public name: string,
    public rate: number,
    public links: string[]
  ) {}
}

class Game {
  minutes: number = 30;

  current: Valve;

  constructor(public valves: Valve[]) {
    this.current = valves.find((it) => it.name === "AA")!;
  }

  step() {
    console.log("current", this.current.name);
    this.valves.forEach((valve) => {
      console.log("current", this.current.name);
    });
  }
}

const OPEN_TIME = 1;

let i = 0;
function bestScore(thisValve: Valve, valves: Valve[], time: number): number {
  i++;

  if (time < 2) {
    return 0;
  }

  const openScore = (time - 1) * thisValve.rate;
  const subScores = valves
    .filter((it) => it.name !== thisValve.name)
    .filter((it) => it.rate > 0)
    .filter((it) => time - thisValve.distance[it.name] > 1)
    .map((it, index, filtered) =>
      bestScore(it, filtered, time - it.distance[thisValve.name] - OPEN_TIME)
    );

  const result = openScore + (subScores.length ? Math.max(...subScores) : 0);

  if (i % 1_000_000 === 0) console.log(i, thisValve.name, time, result);

  return result;
}

function parse(input: string) {
  const valves = input.split("\n").map((line) => {
    const [first, second] = line.split("; ");
    const valveName = first.substring(6, 8);
    const valveRate = parseInt(first.split("=")[1]);
    const valveLink = second.substring(22).trim().split(", ");

    return new Valve(valveName, valveRate, valveLink);
  });

  valves.forEach((valve) => {
    valve.distance = Object.fromEntries(
      valves.map(({ name }) => [name, valve.name === name ? 0 : Infinity])
    );
    valve.valves = valve.links.flatMap((name) => {
      const found = valves.find((v) => v.name === name);
      return found ? [found] : [];
    });
  });

  valves.forEach((valve) => {
    const unvisited = [...valves];
    const getMin = (): Valve | undefined => {
      return unvisited
        .sort((a, b) => b.distance[valve.name] - a.distance[valve.name])
        .pop();
    };

    let current: Valve;

    // @ts-ignore
    while ((current = getMin())) {
      current.valves.forEach((it) => {
        const distanceToValve = 1;
        const viaCurrent = current.distance[valve.name] + distanceToValve;
        if (it.distance[valve.name] > viaCurrent) {
          it.distance[valve.name] = viaCurrent;
        }
      });
    }
  });

  return valves;
}

export function solvePart1(input: string): number {
  const valves = parse(input);
  const game = new Game(valves);

  const AA = valves.find((it) => it.name === "AA")!;
  i = 0;
  const score = bestScore(AA, valves, 31);
  console.log("total", i);
  return score;
}

export { solvePart2 } from './solver2';
