import { memoize } from "lodash";

type GateBase = {
  type: string;
  output: string;
  alias: string;
  inputs: string[];
  isVisited: boolean;
  wires?: [Source, Source];
  bit: number;
};
type XorGate = GateBase & { type: "XOR" };
type OrGate = GateBase & { type: "OR" };
type AndGate = GateBase & { type: "AND" };
type Gate = XorGate | OrGate | AndGate;

type Value = {
  type: "VALUE";
  output: string;
  value: boolean;
  isVisited: boolean;
  bit: number;
};
type Source = Gate | Value;

type HalfAdder = {
  sum: XorGate;
  carry: AndGate;
  gates: Gate[];
};

type FullAdder = {
  sum: XorGate;
  carry: OrGate;
  gates: Gate[];
};

type Adder = HalfAdder | FullAdder;

function halfAdder(a: Source, b: Source, bit: number): HalfAdder {
  const sum: XorGate = {
    type: "XOR",
    output: `x(${a.output}|${b.output})`,
    alias: `x(${a.output}|${b.output})`,
    inputs: [a.output, b.output],
    wires: [a, b],
    isVisited: false,
    bit,
  };
  const carry: AndGate = {
    type: "AND",
    output: `a(${a.output}|${b.output})`,
    alias: `a(${a.output}|${b.output})`,
    inputs: [a.output, b.output],
    wires: [a, b],
    bit,
    isVisited: false,
  };

  return { sum, carry, gates: [sum, carry] };
}

function fullAdder(a: Source, b: Source, c: Source, bit: number): FullAdder {
  const half1 = halfAdder(a, b, bit);
  const half2 = halfAdder(half1.sum, c, bit);

  const sum = half2.sum;
  const carry: OrGate = {
    type: "OR",
    output: `o(${half1.sum.output}|${half2.sum.output})`,
    alias: `o(${half1.sum.output}|${half2.sum.output})`,
    inputs: [half1.carry.output, half2.carry.output],
    wires: [half1.carry, half2.carry],
    bit,
    isVisited: false,
  };

  const gates = [...half1.gates, ...half2.gates, carry];

  return { sum, carry, gates };
}

function parse(input: string) {
  const [valuesT, gatesT] = input.split("\n\n");

  const values = new Map(
    valuesT.split("\n").map((line): [string, Value] => {
      const [value, output] = line.split(": ");
      return [
        value,
        {
          type: "VALUE",
          output: value,
          value: output === "1",
          isVisited: true,
          bit: parseInt(value.substring(1), 10),
        },
      ];
    })
  );

  const gates = new Map(
    gatesT.split("\n").map((line): [string, Gate] => {
      const [source, output] = line.split(" -> ");
      const [inputA, type, inputB] = source.split(" ");

      if (type === "AND" || type === "OR" || type === "XOR") {
        return [
          output,
          {
            type,
            output,
            alias: output,
            inputs: [inputA, inputB],
            isVisited: false,
            bit: -1,
          },
        ];
      }

      process.exit(-1);
    })
  );

  // connect wires
  gates.forEach((gate) => {
    gate.wires = gate.inputs.map(
      (input) => gates.get(input) || values.get(input)
    ) as [Source, Source];
  });

  return { values, gates };
}

const getValue = memoize(function (source: Source): boolean {
  if (source.type === "VALUE") return source.value;

  const [valueA, valueB] = source.wires!.map((wire) => getValue(wire!));

  return source.type === "AND"
    ? valueA && valueB
    : source.type === "OR"
    ? valueA || valueB
    : source.type === "XOR"
    ? valueA !== valueB
    : false;
});

function getOutput(gates: Map<string, Gate>): number {
  const bits = [...gates.keys()]
    .filter((key) => key.startsWith("z"))
    .sort()
    .reverse();

  const bin = bits
    .map((key) => gates.get(key)!)
    .map((gate) => (getValue(gate) ? 1 : 0))
    .join("");

  return parseInt(bin, 2);
}

function decodeValue(values: Map<string, Value>, prefix: "x" | "y") {
  return parseInt(
    [...values.keys()]
      .filter((k) => k.startsWith(prefix))
      .sort()
      .reverse()
      .map((k) => (values.get(k)!.value ? 1 : 0))
      .join(""),
    2
  );
}

export function solvePart1(input: string): number {
  const { gates } = parse(input);
  return getOutput(gates);
}

function isNext(it: Gate) {
  return it.wires!.every((wire) => (wire as Gate).isVisited) && !it.isVisited;
}

function getKey(it: Gate) {
  return it
    .wires!.map((w) => w.output)
    .sort()
    .join(` ${it.type} `);
}

export function solvePart2(input: string, swaps: string[][] = []): string {
  let alteredInput = input;
  swaps.forEach(([a, b]) => {
    alteredInput = alteredInput
      .replace(`-> ${a}`, "XXX")
      .replace(`-> ${b}`, `-> ${a}`)
      .replace("XXX", `-> ${b}`);
  });

  const { values, gates } = parse(alteredInput);

  // ignore examples
  if (values.size < 20) return "";

  const x = decodeValue(values, "x");
  const y = decodeValue(values, "y");
  const expectedValue = x + y;
  const actualValue = getOutput(gates);

  if (expectedValue === actualValue) return swaps.flat().sort().join(",");

  const outputBits = [...gates.keys()]
    .filter((key) => key.startsWith("z"))
    .sort()
    .map((key) => gates.get(key)!);

  const expected = outputBits.reduce<Adder[]>((chain, gate, i) => {
    const number = gate.output.substring(1);
    const bit = parseInt(number, 10);
    const xbit = values.get(`x${number}`);
    const ybit = values.get(`y${number}`);

    if (xbit && ybit) {
      if (i === 0) chain.push(halfAdder(xbit, ybit, bit));
      else chain.push(fullAdder(xbit, ybit, chain[i - 1].carry, bit));
    }

    return chain;
  }, []);

  const actualGates = [...gates.values()];
  const expectedGates = expected.flatMap((adder) => adder.gates);

  let toWalk = actualGates.filter(isNext);
  while (toWalk.length) {
    const off: Gate[] = [];

    toWalk.forEach((gate) => {
      const gateKey = getKey(gate);

      const found = expectedGates.find((it) => getKey(it) === gateKey);

      if (!found) {
        off.push(gate);
        return;
      }

      gate.output = found.output;
      gate.bit = found.bit;
      gate.isVisited = true;
    });

    if (off.length) {
      const gate = off[0];

      // console.log(gate);
      // console.log("to replace one of", gate.inputs);

      // const bits = gate.wires!.map((it) => (it as Gate).bit);

      // actualGates
      //   .filter((it) => bits.includes(it.bit))
      //   .forEach((it) => {
      //     console.log(getKey(it), it.alias);
      //   });

      if (gate.type === "OR") {
        // only AND, so any other is wrong
        const wrong = gate.wires!.find((it) => it.type !== "AND")! as Gate;
        const other = gate.wires!.find((it) => it.type === "AND")! as Gate;

        // find other AND to make a replacement
        const correct = actualGates.find(
          (it) => it.type === "AND" && it.bit === other!.bit && it !== other
        );

        const newSwaps = [...swaps, [wrong.alias, correct!.alias]];

        return solvePart2(input, newSwaps);
      }

      if (gate.type === "AND") {
        // AND is either simple (1st half adder) or has input from prev full adder (OR) and XOR from inputs
        const other = gate
          .wires!.filter((it) => it.type === "XOR")
          .sort((a, b) => b.bit - a.bit)[0];
        const wrong = gate.wires!.find((it) => it !== other)! as Gate;

        const correct = actualGates.find(
          (it) => it.type === "OR" && it.bit === other!.bit - 1
        );

        return solvePart2(input, [...swaps, [wrong.alias, correct!.alias]]);
      }

      if (gate.type === "XOR") {
        const orGate = gate.wires!.find((it) => it.type === "OR")! as Gate;
        const xorGate = gate.wires!.find((it) => it.type === "XOR")! as Gate;

        if (!orGate) {
          const other = xorGate;
          const wrong = gate.wires!.find((it) => it !== other)! as Gate;

          const correct = actualGates.find(
            (it) => it.type === "OR" && it.bit === other!.bit - 1
          );
          return solvePart2(input, [...swaps, [wrong.alias, correct!.alias]]);
        }

        if (!xorGate) {
          const other = orGate;
          const wrong = gate.wires!.find((it) => it !== other)! as Gate;

          const correct = actualGates.find(
            (it) => it.type === "XOR" && it.bit === other!.bit + 1
          );
          return solvePart2(input, [...swaps, [wrong.alias, correct!.alias]]);
        }
      }

      process.exit(-1);
    }

    toWalk = actualGates.filter(isNext);
  }

  return "";
}
