type Rule = { prev: string; next: string };
type Update = string[];

function parse(input: string) {
  const [rulesT, updatesT] = input.split("\n\n");
  const rules = rulesT.split("\n").map((line) => {
    const [prev, next] = line.split("|");
    return { prev, next };
  });
  const updates = updatesT.split("\n").map((line) => line.split(","));

  return { rules, updates };
}

function isValidBasedOn(rules: Rule[]) {
  return (update: Update) => {
    for (let i = 0; i < update.length - 1; i++) {
      const curr = update[i];
      const after = update.slice(i + 1);

      const invalidRules = rules.filter(
        ({ prev, next }) => next === curr && after.includes(prev)
      );

      if (invalidRules.length > 0) {
        return false;
      }
    }

    return true;
  };
}

function getCenter(update: Update): number {
  return parseInt(update[Math.floor((update.length - 1) / 2)]);
}

export function solvePart1(input: string): number {
  const { rules, updates } = parse(input);

  return updates
    .filter(isValidBasedOn(rules))
    .map(getCenter)
    .reduce((acc, it) => acc + it);
}
export function solvePart2(input: string): number {
  const { rules, updates } = parse(input);
  const isValid = isValidBasedOn(rules);
  const isInvalid = (it: Update) => !isValid(it);

  const fixUpdate = (update: string[]) => {
    const fixed = [...update];

    fixed.sort((a, b) => {
      if (rules.find(({ prev, next }) => prev === a && next === b)) return -1;
      if (rules.find(({ prev, next }) => prev === b && next === a)) return 1;
      return 0;
    });

    return fixed;
  };

  return updates
    .filter(isInvalid)
    .map(fixUpdate)
    .map(getCenter)
    .reduce((acc, it) => acc + it);
}
