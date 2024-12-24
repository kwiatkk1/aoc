import { memoize } from "lodash";

type GateBase = {
  type: string;
  output: string;
  inputs: string[];
  inputA?: Source;
  inputB?: Source;
};
type XorGate = GateBase & { type: "XOR" };
type OrGate = GateBase & { type: "OR" };
type AndGate = GateBase & { type: "AND" };
type Gate = XorGate | OrGate | AndGate;

type Value = { type: "VALUE"; value: boolean };
type Source = Gate | Value;

function parse(input: string) {
  const [valuesT, gatesT] = input.split("\n\n");

  const values = new Map(
    valuesT.split("\n").map((line): [string, Value] => {
      const [value, output] = line.split(": ");
      return [value, { type: "VALUE", value: output === "1" }];
    })
  );

  const gates = new Map(
    gatesT.split("\n").map((line): [string, Gate] => {
      const [source, output] = line.split(" -> ");
      const [inputA, type, inputB] = source.split(" ");

      if (type === "AND" || type === "OR" || type === "XOR") {
        return [output, { type, output, inputs: [inputA, inputB] }];
      }

      process.exit(-1);
    })
  );

  // connect wires
  gates.forEach((gate) => {
    const [inputA, inputB] = gate.inputs;

    gate.inputA = gates.get(inputA) || values.get(inputA);
    gate.inputB = gates.get(inputB) || values.get(inputB);
  });

  return { values, gates };
}

const getValue = memoize(function (source: Source): boolean {
  if (source.type === "VALUE") return source.value;

  // console.log("getValue", source);

  const valueA = getValue(source.inputA!);
  const valueB = getValue(source.inputB!);

  return source.type === "AND"
    ? valueA && valueB
    : source.type === "OR"
    ? valueA || valueB
    : source.type === "XOR"
    ? valueA !== valueB
    : false;
});

export function solvePart1(input: string): number {
  const { gates } = parse(input);

  const bits = [...gates.keys()]
    .filter((key) => key.startsWith("z"))
    .sort()
    .reverse();

  const bin = bits
    .map((key) => gates.get(key)!)
    .map((gate) => getValue(gate) ? 1 : 0)
    .join("");

  return parseInt(bin, 2);
}

export function solvePart2(input: string): number {
  return -1;
}
