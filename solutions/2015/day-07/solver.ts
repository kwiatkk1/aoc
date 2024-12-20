import { memoize } from "lodash";

type Element = {
  type: string;
  output: string;
  inputs: string[];
  inputA?: Source | number;
};
type NotGate = Element & { type: "NOT" };
type OrGate = Element & { type: "OR"; inputB?: Source | number };
type AndGate = Element & { type: "AND"; inputB?: Source | number };
type LShiftGate = Element & { type: "LSHIFT"; shift: number };
type RShiftGate = Element & { type: "RSHIFT"; shift: number };
type Wire = Element & { type: "WIRE" };
type Value = Element & { type: "VALUE"; value: number };
type Source =
  | NotGate
  | OrGate
  | AndGate
  | LShiftGate
  | RShiftGate
  | Wire
  | Value;

function parse(input: string) {
  const lines = input.split("\n");
  const sources = lines.map((line): Source => {
    const [source, output] = line.split(" -> ");
    const [inputA, type, inputB] = source.split(" ");

    if (inputA === "NOT") {
      return { type: "NOT", output, inputs: [type] };
    }

    if (!type) {
      const value = parseInt(inputA);

      if (isNaN(value)) {
        return { type: "WIRE", output, inputs: [inputA] };
      }

      return { type: "VALUE", output, inputs: [], value };
    }

    if (type === "AND" || type === "OR") {
      return { type, output, inputs: [inputA, inputB] };
    }

    if (type === "LSHIFT" || type === "RSHIFT") {
      return {
        type,
        output,
        inputs: [inputA],
        shift: parseInt(inputB),
      };
    }

    process.exit(-1);
  });

  const wires = new Map(sources.map((source) => [source.output, source]));

  // connect wires
  wires.forEach((source) => {
    const [inputA, inputB] = source.inputs;

    if (inputA) {
      source.inputA = wires.get(inputA) || parseInt(inputA);
    }

    if (source.type === "AND" || source.type === "OR") {
      source.inputB = wires.get(inputB) || parseInt(inputB);
    }
  });

  return wires;
}

const to16Bit = (n: number) => n & 65535;

const getValue = memoize(function (source?: Source | number): number {
  if (typeof source === "number") return source;
  if (typeof source === "undefined") return NaN;

  const { type } = source;
  const valueA = getValue(source.inputA);
  const valueB = "inputB" in source ? getValue(source.inputB) : NaN;

  const output =
    type === "AND"
      ? valueA & valueB
      : type === "OR"
      ? valueA | valueB
      : type === "NOT"
      ? ~valueA
      : type === "LSHIFT"
      ? valueA << source.shift
      : type === "RSHIFT"
      ? valueA >> source.shift
      : type === "WIRE"
      ? valueA
      : type === "VALUE"
      ? source.value
      : NaN;

  return to16Bit(output);
});

export function solvePart1(input: string): number {
  const wires = parse(input);
  const wire = wires.get("a");
  return wire ? getValue(wire) : -1;
}

export function solvePart2(input: string): number {
  const valueA = solvePart1(input);
  return solvePart1(input.replace(/\n(.+) -> b\n/, `\n${valueA} -> b\n`));
}
