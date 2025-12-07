type Str = {
  str: string;
  len: number;
  mem: number;
  encodedLen: number;
};

const toEscape = ["\\", '"'];

function parse(input: string): Str[] {
  return input.split("\n").map(
    (line): Str => ({
      str: line,
      len: line.length,
      mem: line.replaceAll(/\\x[0-9a-f]{2}|\\["\\]/g, "X").length - 2,
      encodedLen: line
        .split("")
        .reduce((len, char) => len + (toEscape.includes(char) ? 2 : 1), 2),
    })
  );
}

export function solvePart1(input: string): number {
  return parse(input).reduce((diff, str) => diff + str.len - str.mem, 0);
}

export function solvePart2(input: string): number {
  return parse(input).reduce((diff, str) => diff + str.encodedLen - str.len, 0);
}
