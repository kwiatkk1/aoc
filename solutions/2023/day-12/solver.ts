type RecordRow = {
  groups: number[];
  springs: string;
};

function parse(input: string) {
  return input.split("\n").map<RecordRow>((line) => {
    const [springs, b] = line.split(" ");
    return {
      springs: springs.split(/\.+/).join("."),
      groups: b.split(",").map((it) => parseInt(it)),
    };
  });
}

function getNumberOfSolutionsBruteforce({
  springs,
  groups,
}: RecordRow): number {
  const hasUnknown = springs.includes("?");

  if (!hasUnknown) {
    const finalGroups = springs
      .split(".")
      .filter((it) => it)
      .map((it) => it.length);

    return finalGroups.join(",") === groups.join(",") ? 1 : 0;
  }

  const withSpring = springs.replace("?", "#");
  const withoutSpring = springs.replace("?", ".");

  return (
    getNumberOfSolutionsBruteforce({ groups: groups, springs: withSpring }) +
    getNumberOfSolutionsBruteforce({ groups: groups, springs: withoutSpring })
  );
}

function unfold(record: RecordRow): RecordRow {
  return {
    groups: Array(5)
      .fill(record.groups.join(","))
      .join(",")
      .split(",")
      .map((it) => parseInt(it)),
    springs: Array(5)
      .fill(record.springs)
      .join("?")
      .split(/\.+/)
      .filter((it) => it)
      .join("."),
  };
}

function getNumberOfSolutions(
  { springs, groups }: RecordRow,
  cache: Map<string, number> = new Map()
): number {
  const key = `${springs}|${groups.join(",")}`;
  const [group, ...remainingGroups] = groups;

  if (cache.has(key)) return cache.get(key)!;
  if (!group) return springs.includes("#") ? 0 : 1;
  if (!springs) return 0;

  let solutionsCount = 0;

  for (let indexFrom = 0; indexFrom < springs.length; indexFrom++) {
    if (group <= springs.length - indexFrom) {
      const indexTo = indexFrom + group;
      const window = springs.substring(indexFrom, indexTo);
      const groupFits = !window.includes(".");
      const noSpringAfter = springs.substring(indexTo, indexTo + 1) !== "#";

      if (groupFits && noSpringAfter) {
        solutionsCount += getNumberOfSolutions(
          {
            springs: springs.substring(indexTo + 1),
            groups: remainingGroups,
          },
          cache
        );
      }
    }

    if (springs[indexFrom] === "#") break;
  }

  cache.set(key, solutionsCount);
  return solutionsCount;
}

export function solvePart1(input: string): number {
  return parse(input)
    .map((record) => getNumberOfSolutions(record))
    .reduce((sum, it) => sum + it, 0);
}
export function solvePart2(input: string): number {
  return parse(input)
    .map((it) => unfold(it))
    .map((record) => getNumberOfSolutions(record))
    .reduce((sum, it) => sum + it, 0);
}
