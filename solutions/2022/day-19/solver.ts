type ResourceType = "ore" | "clay" | "obsidian" | "geode";
type Cost = Record<ResourceType, number>;

class State {
  robots: Record<ResourceType, number>;
  robotsBuilding: Record<ResourceType, number>;
  resources: Record<ResourceType, number>;
  cache: Map<string, number>;

  constructor(public blueprint: Blueprint, public time: number) {
    this.robots = {
      ore: 1,
      clay: 0,
      obsidian: 0,
      geode: 0,
    };
    this.robotsBuilding = {
      ore: 0,
      clay: 0,
      obsidian: 0,
      geode: 0,
    };
    this.resources = {
      ore: 0,
      clay: 0,
      obsidian: 0,
      geode: 0,
    };
    this.cache = new Map();
  }

  clone(): State {
    const nextState = new State(this.blueprint, this.time);
    nextState.robots = { ...this.robots };
    nextState.resources = { ...this.resources };
    nextState.robotsBuilding = { ...this.robotsBuilding };
    nextState.cache = this.cache;
    return nextState;
  }

  collect(): State {
    Object.entries(this.robots).forEach(([robot, count]) => {
      this.resources[robot as ResourceType] += count;
    });
    Object.entries(this.robotsBuilding).forEach(([robot, count]) => {
      this.robots[robot as ResourceType] += count;
      this.robotsBuilding[robot as ResourceType] = 0;
    });
    return this;
  }

  getPossibleStates(): State[] {
    const possibleRobots: ResourceType[] = ["obsidian", "clay", "ore"];

    const nextStateDoNothing = this.clone();
    nextStateDoNothing.time -= 1;
    const isNeeded = (t: ResourceType) =>
      this.robots[t] < this.blueprint.getMax(t);

    const possible: ResourceType[] = [
      "geode",
      ...possibleRobots.filter(isNeeded),
    ];

    const nextStateBuy = possible.flatMap((t: ResourceType) => {
      const nextState = this.clone();
      const robotCost = this.blueprint[t];
      const { resources } = nextState;
      nextState.time -= 1;

      if (
        resources.ore >= robotCost.ore &&
        (!robotCost.clay || resources.clay >= robotCost.clay) &&
        (!robotCost.obsidian || resources.obsidian >= robotCost.obsidian)
      ) {
        nextState.resources.ore -= robotCost.ore;
        nextState.resources.clay -= robotCost.clay;
        nextState.resources.obsidian -= robotCost.obsidian;
        nextState.robotsBuilding[t] += 1;
        return [nextState];
      }

      return [];
    });

    return [...nextStateBuy, nextStateDoNothing].map((it) => it.collect());
  }

  hash() {
    return [
      this.time,
      Object.values(this.robots).join("x"),
      Object.entries(this.resources)
        .map(([k, c]) => Math.min(c, this.blueprint.getMax(k as ResourceType)))
        .join("x"),
    ].join("|");
  }

  toJSON() {
    return {
      time: this.time,
      rsrc: this.resources,
      rbts: this.robots,
      blds: this.robotsBuilding,
    };
  }
}

class Blueprint {
  constructor(
    public ore: Cost,
    public clay: Cost,
    public obsidian: Cost,
    public geode: Cost
  ) {}

  getMax(t: ResourceType) {
    return Math.max(this.ore[t], this.clay[t], this.obsidian[t], this.geode[t]);
  }
}

function parse(input: string): Blueprint[] {
  const getCost = (
    it: Partial<Record<ResourceType, number>>
  ): Record<ResourceType, number> => ({
    ore: it.ore || 0,
    clay: it.clay || 0,
    obsidian: it.obsidian || 0,
    geode: it.geode || 0,
  });

  return input.split("\n").map((line) => {
    const [oreLine, clayLine, obsidianLine, geodeLine] = line
      .split(": ")[1]
      .split(/\. ?/);

    const ore = { ore: parseInt(oreLine.split(" ")[4]) };
    const clay = { ore: parseInt(clayLine.split(" ")[4]) };
    const obsidian = {
      ore: parseInt(obsidianLine.split(" ")[4]),
      clay: parseInt(obsidianLine.split(" ")[7]),
    };
    const geode = {
      ore: parseInt(geodeLine.split(" ")[4]),
      obsidian: parseInt(geodeLine.split(" ")[7]),
    };

    return new Blueprint(
      getCost(ore),
      getCost(clay),
      getCost(obsidian),
      getCost(geode)
    );
  });
}

function bestScore(state: State): number {
  if (state.time < 1) return state.resources.geode;
  const hash = state.hash();

  if (state.cache.has(hash)) {
    return state.cache.get(hash) || 0;
  }

  if (state.time < state.blueprint.obsidian.clay + 1 && state.robots.clay < 1)
    return 0;
  if (
    state.time < state.blueprint.geode.obsidian + 1 &&
    state.robots.obsidian < 1
  )
    return 0;

  const options: State[] = state.getPossibleStates();

  const result = options.length
    ? Math.max(...options.map((next) => bestScore(next)))
    : 0;

  state.cache.set(hash, result);

  return result;
}
export function solvePart1(input: string): number {
  return parse(input)
    .map((blueprint, i) => {
      const score = bestScore(new State(blueprint, 24));
      console.log("i", i + 1, "score", score, "quality", (i + 1) * score);
      return score;
    })
    .reduce((sum, score, i) => sum + score * (i + 1), 0);
}

export function solvePart2(input: string): number {
  return parse(input)
    .slice(0, 3)
    .map((blueprint, i) => {
      const score = bestScore(new State(blueprint, 32));
      console.log("i", i + 1, "score", score);
      return score;
    })
    .reduce((sum, score) => sum * score, 1);
}
