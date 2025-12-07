type Traits =
  | "children"
  | "cats"
  | "samoyeds"
  | "pomeranians"
  | "akitas"
  | "vizslas"
  | "goldfish"
  | "trees"
  | "cars"
  | "perfumes";

type Trait = { name: Traits; value: number };
type Sue = { number: number; traits: Trait[] };
type Matcher = (value: number) => boolean;

const exact = (value: number) => (it: number) => it === value;
const greaterThan = (value: number) => (it: number) => it > value;
const fewerThan = (value: number) => (it: number) => it < value;

function parse(input: string): Sue[] {
  return input.split("\n").map((line) => {
    const splitIndex = line.indexOf(":");
    const number = parseInt(line.substring(4, splitIndex));
    const traits = line
      .substring(splitIndex + 2)
      .split(", ")
      .map((c) => c.split(": "))
      .map(([name, v]) => <Trait>{ name, value: parseInt(v) });
    return { number, traits };
  });
}

export function solve(input: string, matchers: Record<Traits, Matcher>) {
  return parse(input).find((sue) =>
    sue.traits.every((trait) => matchers[trait.name](trait.value))
  )?.number;
}

export function solvePart1(input: string) {
  return solve(input, {
    children: exact(3),
    cats: exact(7),
    samoyeds: exact(2),
    pomeranians: exact(3),
    akitas: exact(0),
    vizslas: exact(0),
    goldfish: exact(5),
    trees: exact(3),
    cars: exact(2),
    perfumes: exact(1),
  });
}

export function solvePart2(input: string) {
  return solve(input, {
    children: exact(3),
    cats: greaterThan(7),
    samoyeds: exact(2),
    pomeranians: fewerThan(3),
    akitas: exact(0),
    vizslas: exact(0),
    goldfish: fewerThan(5),
    trees: greaterThan(3),
    cars: exact(2),
    perfumes: exact(1),
  });
}
