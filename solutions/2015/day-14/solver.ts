type Reindeer = {
  name: string;
  speed: number;
  fly: number;
  rest: number;
};

const max = (max: number, it: number) => Math.max(max, it);

function parse(input: string) {
  return input.split("\n").map((line): Reindeer => {
    const [name, ...args] = line.split(" ");
    const [speed, fly, rest] = args
      .map((it) => parseInt(it))
      .filter((it) => !isNaN(it));
    return { name, speed, fly, rest };
  });
}

function positionAt(time: number, deer: Reindeer): number {
  const cycleMove = deer.speed * deer.fly;
  const cycleTime = deer.fly + deer.rest;
  const cyclesNum = Math.floor(time / cycleTime);
  const reminderT = time - cyclesNum * cycleTime;
  const reminderD = deer.speed * Math.min(reminderT, deer.fly);

  return cyclesNum * cycleMove + reminderD;
}

export function solvePart1(input: string): number {
  const reindeers = parse(input);
  const isExample = reindeers.length === 2;
  const endT = isExample ? 1000 : 2503;

  return reindeers.map((it) => positionAt(endT, it)).reduce(max);
}

export function solvePart2(input: string): number {
  const reindeers = parse(input);
  const isExample = reindeers.length === 2;
  const endT = isExample ? 1000 : 2503;
  const scores: Record<Reindeer["name"], number> = {};

  for (let t = 1; t < endT; t++) {
    const distances = reindeers.map((reindeer) => ({
      reindeer,
      position: positionAt(t, reindeer),
    }));

    const winningDistance = distances.map((it) => it.position).reduce(max);
    const winningReindeers = distances
      .filter((it) => it.position === winningDistance)
      .map((it) => it.reindeer);

    winningReindeers.forEach((reindeer) => {
      scores[reindeer.name] = scores[reindeer.name] || 0;
      scores[reindeer.name] += 1;
    });
  }

  return Object.values(scores).reduce(max);
}
