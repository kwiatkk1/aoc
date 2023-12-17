function parse(input: string): string[][] {
  return input.split("\n").map((line) => line.split(""));
}

export function solvePart1(input: string): number[] {
  return parse(input).map((line) =>
    line.reduce((floor, c) => floor + (c === "(" ? 1 : -1), 0)
  );
}

export function solvePart2(input: string): number[] {
  return parse(input).map((line) => {
    let basementIndex = Infinity;

    line.reduce((previousFloor, c, currentIndex) => {
      const floor = previousFloor + (c === "(" ? 1 : -1);
      if (floor < 0 && basementIndex === Infinity) basementIndex = currentIndex;
      return floor + (c === "(" ? 1 : -1);
    }, 0);

    return basementIndex + 1;
  });
}
