function getCommonChar(a: string, b: string): string {
  const bb = b.split("");
  return a.split("").find((it) => bb.indexOf(it) > -1) || "";
}

function getCommonCharOf3(a: string, b: string, c: string): string {
  const bb = b.split("");
  const cc = c.split("");
  return (
    a.split("").find((it) => bb.indexOf(it) > -1 && cc.indexOf(it) > -1) || ""
  );
}

function getChasScore(char: string) {
  const code = char.charCodeAt(0);

  if (code >= 97) return code - 97 + 1;
  return code - 65 + 27;
}

function getRucksackScore(rucksack: string) {
  const half = rucksack.length / 2;
  const halfA = rucksack.substring(0, half);
  const halfB = rucksack.substring(half);
  const common = getCommonChar(halfA, halfB);
  const score = getChasScore(common);
  console.log(halfA, halfB, common, score);
  return score;
}

export function solvePart1(input: string): number {
  const rucksacks = input.split("\n");
  const score = rucksacks.reduce((sum, it) => sum + getRucksackScore(it), 0);
  return score;
}

export function solvePart2(input: string): number {
  const rucksacks = input.split("\n");
  let sum = 0;

  for (let group = 0; group < rucksacks.length / 3; group++) {
    let groupRucksacks = rucksacks.slice(group * 3, group * 3 + 3);
    let common = getCommonCharOf3(
      groupRucksacks[0],
      groupRucksacks[1],
      groupRucksacks[2]
    );
    let score = getChasScore(common);
    sum += score;
  }

  return sum;
}
