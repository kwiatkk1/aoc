type Race = {
  time: number;
  distance: number;
};

function parseValues(line: string): number[] {
  const [header, valuesLine] = line.split(":");
  return valuesLine
    .trim()
    .split(/\s+/)
    .map((it) => parseInt(it.trim()));
}

function mergeRaces(races: Race[]): Race {
  return {
    time: parseInt(
      races
        .map((race) => race.time)
        .map((t) => t.toString())
        .join("")
    ),
    distance: parseInt(
      races
        .map((race) => race.distance)
        .map((t) => t.toString())
        .join("")
    ),
  };
}

function parse(input: string): Race[] {
  const [timesLine, distancesLine] = input.split("\n");
  const times = parseValues(timesLine);
  const distances = parseValues(distancesLine);

  return times.map((time, index) => ({ time, distance: distances[index] }));
}

function isWin(race: Race, t: number): boolean {
  const speed = t;
  const moveTime = race.time - t;
  return moveTime * speed > race.distance;
}

function getNumbersOfWaysToWin(race: Race): number {
  let winCounts = 0;
  for (let t = 1; t < race.distance; t++) {
    if (isWin(race, t)) {
      winCounts += 1;
    } else if (winCounts > 0) {
      break;
    }
  }

  return winCounts;
}

export function solvePart1(input: string): number {
  const races = parse(input);

  return races.reduce(
    (totalScore, race) => totalScore * getNumbersOfWaysToWin(race),
    1
  );
}
export function solvePart2(input: string): number {
  const races = parse(input);
  const race = mergeRaces(races);

  return getNumbersOfWaysToWin(race);
}
