type Rule = (it: string[]) => boolean;

function parse(input: string): string[][] {
  return input.split("\n").map((it) => it.split(""));
}

function getIsNice(rules: Rule[]): Rule {
  return (it: string[]) => rules.every((rule) => rule(it));
}

export function solvePart1(input: string): number {
  const isNice = getIsNice([
    (it) => it.filter((it) => "aeiou".includes(it)).length >= 3,
    (it) => it.some((it, index, arr) => it === arr[index + 1]),
    (it) => {
      const s = it.join("");
      const excludes = ["ab", "cd", "pq", "xy"];
      return !excludes.some((it) => s.includes(it));
    },
  ]);

  return parse(input).filter(isNice).length;
}
export function solvePart2(input: string): number {
  const isNice = getIsNice([
    (it) =>
      it.some((it, index, arr) => {
        const pair = it + arr[index + 1];
        const rest = arr.slice(index + 2).join("");
        return rest.includes(pair);
      }),
    (it) => it.some((it, index, arr) => it === arr[index + 2]),
  ]);

  return parse(input).filter(isNice).length;
}
