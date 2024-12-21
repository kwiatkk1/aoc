import { memoize } from "lodash";
import { Board, BoardNode } from "../../../utils/board";

type Code = {
  chars: string;
  numeric: number;
};

type Step = {
  src: string;
  dst: string;
};

const toSteps = (dst: string, index: number, all: string[]): Step => ({
  src: index ? all[index - 1] : "A",
  dst,
});

const sum = (a: number, b: number) => a + b;

const parse = (input: string) =>
  input.split("\n").map(
    (line): Code => ({
      chars: line,
      numeric: parseInt(line, 10),
    })
  );

type Key = string;
const toKey = ({ char }: { char: string }): Key => char;
const keyValidator = (it: BoardNode<string>) => it.value !== "#";

const numBoard = Board.from(
  ["789", "456", "123", "#0A"].join("\n"),
  toKey,
  keyValidator
);
const dirBoard = Board.from(["#^A", "<v>"].join("\n"), toKey, keyValidator);

function getSequences(step: Step, keyboard: Board<Key>) {
  const srcKey = keyboard.find(({ value }) => value === step.src)!;
  const dstKey = keyboard.find(({ value }) => value === step.dst)!;
  const directions = keyboard.getAllDirections(srcKey, dstKey);

  const map = {
    U: "^",
    D: "v",
    L: "<",
    R: ">",
  };

  return directions.map(
    (sequence) => sequence.map((dir) => map[dir]).join("") + "A"
  );
}

function dirSequence(step: Step): string[] {
  return getSequences(step, dirBoard);
}

function toDirSequences(step: Step) {
  return getSequences(step, numBoard);
}

function minDirLength(step: Step, level: number): number {
  const sequences = dirSequence(step);

  if (level === 0) return sequences[0].length;

  const lengths = sequences.map((sequence) =>
    sequence
      .split("")
      .map(toSteps)
      .map((step) => minDirLengthMemo(step, level - 1))
      .reduce(sum)
  );

  return Math.min(...lengths);
}

const minDirLengthMemo = memoize(
  minDirLength,
  (step, level) => `${step.src}|${step.dst}|${level}`
);

function minNumLength(code: string, robots: number): number {
  return code
    .split("")
    .map(toSteps)
    .map(toDirSequences)
    .map((sequences) =>
      sequences.map((sequence) =>
        sequence
          .split("")
          .map(toSteps)
          .map((step) => minDirLengthMemo(step, robots - 1))
          .reduce(sum)
      )
    )
    .map((paths) => Math.min(...paths))
    .reduce(sum);
}

function solve(input: string, robots: number) {
  const complexity = (it: Code) => it.numeric * minNumLength(it.chars, robots);
  return parse(input).map(complexity).reduce(sum);
}

export const solvePart1 = (input: string): number => solve(input, 2);
export const solvePart2 = (input: string): number => solve(input, 25);
