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

const OPEN_TIME = 1;

const cache = new Map();

function bestSingle(thisValve: Valve, valves: Valve[], time: number): number {
  i++;

  if (time < 2) {
    return 0;
  }

  const key = `${thisValve.name}|${valves
    .map((i) => i.name)
    .sort()
    .join()}|${time}`;
  if (cache.has(key)) {
    return cache.get(key);
  }

  const openScore = (time - 1) * thisValve.rate;
  const subScores = valves
    .filter((it) => it.name !== thisValve.name)
    .filter((it) => it.rate > 0)
    .filter((it) => time - thisValve.distance[it.name] > 1)
    .map((it, index, filtered) =>
      bestSingle(it, filtered, time - it.distance[thisValve.name] - OPEN_TIME)
    );
  const score = openScore + (subScores.length ? Math.max(...subScores) : 0);
  cache.set(key, score);
  return score;
}

const cache2 = new Map();

let i = 0;
function getScore(
  aValue: Valve | null,
  aTime: number,

  bValue: Valve | null,
  bTime: number,

  values: Valve[],

  level = 0
): number {
  i++;

  const key = `${aValue?.name || null}|${aTime}|${
    bValue?.name || null
  }|${bTime}${values
    .map((i) => i.name)
    .sort()
    .join()}`;

  if (cache2.has(key)) {
    return cache2.get(key);
  }

  if (i % 1e6 === 0)
    console.log(i, aValue && aValue.name, aTime, bValue && bValue.name, bTime, {
      level,
    });

  if (!aValue && !bValue) return 0;
  if (aTime < 1 && bTime < 1) return 0;

  const considered = values
    .filter(({ name }) => name !== aValue?.name && name !== bValue?.name)
    .filter(({ rate }) => rate > 0);

  const openScoreA = aValue ? (aTime - 1) * aValue.rate : 0;
  const openScoreB = bValue ? (bTime - 1) * bValue.rate : 0;
  const openScore = openScoreA + openScoreB;

  const pairs = [...considered, null]
    .flatMap((a) => [...considered, null].map((b) => ({ a, b })))
    .filter((pair) => pair.a !== pair.b);

  const subScores = pairs.map(({ a, b }) => {
    const remaining = considered.filter(
      ({ name }) => name !== a?.name && name !== b?.name
    );

    let nextA = null;
    let nextTimeA = 0;

    if (aTime > 2 && aValue && a && aTime - aValue.distance[a.name] > 1) {
      nextA = a;
      nextTimeA = nextA ? aTime - a.distance[aValue.name] - OPEN_TIME : 0;
    }

    let nextB = null;
    let nextTimeB = 0;

    if (bTime > 2 && bValue && b && bTime - bValue.distance[b.name] > 1) {
      nextB = b;
      nextTimeB = nextB ? bTime - b.distance[bValue.name] - OPEN_TIME : 0;
    }

    if (nextA === null && nextB) return bestSingle(nextB, remaining, nextTimeB);
    if (nextB === null && nextA) return bestSingle(nextA, remaining, nextTimeA);

    return nextA === nextB
      ? 0
      : getScore(nextA, nextTimeA, nextB, nextTimeB, remaining, level + 1);
  });

  const subScore = subScores.length ? Math.max(...subScores) : 0;

  cache2.set(key, openScore + subScore);

  // if (i < 20)
  //   console.log(i, aValue && aValue.name, bValue && bValue.name, {
  //     openScore,
  //     subScore,
  //   });

  return openScore + subScore;
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

export function solvePart2(input: string): number {
  const allValves = parse(input);
  const startValve = allValves.find((it) => it.name === "AA")!;

  i = 0;
  const steps1 = 31;
  const score1 = getScore(startValve, steps1, null, steps1, allValves);
  console.log("total checks", i, "for", steps1 - 1, "steps", "score", score1); // total checks 4217 for 26 steps score 1707

  i = 0;
  const steps2 = 27;
  const score = getScore(startValve, steps2, startValve, steps2, allValves);
  console.log("total checks", i, "for", steps2 - 1, "steps", "score", score); // total checks 259209273 for 26 steps score 2455

  return score;
}
