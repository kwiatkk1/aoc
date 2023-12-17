import { createHash } from "crypto";

function toMd5Hex(data: string): string {
  return createHash("md5").update(data).digest("hex");
}

function parse(input: string): string[] {
  return input.split("\n");
}

export function solvePart1(input: string) {
  return parse(input).map((key) => {
    let i = 0;
    while (!toMd5Hex(`${key}${i}`).startsWith("00000")) i++;
    return i;
  });
}
export function solvePart2(input: string) {
  return parse(input).map((key) => {
    let i = 0;
    while (!toMd5Hex(`${key}${i}`).startsWith("000000")) i++;
    return i;
  });
}
