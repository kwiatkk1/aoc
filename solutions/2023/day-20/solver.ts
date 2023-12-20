import { lcmOf } from "../../../utils/lcm";

type Node = {
  name: string;
  next: Gate[];
  prev: Gate[];
  dependsOn: Gate[];
  nextText: string[];
  getKey: typeof getKey;
};

type Flp = Node & { kind: "flp"; stateHigh: boolean };
type Con = Node & { kind: "con"; signalsIn: boolean[] };
type Btn = Node & { kind: "btn" };
type Bbc = Node & { kind: "bbc" };
type Out = Node & { kind: "out" };

type Gate = Flp | Con | Btn | Bbc | Out;

function newGate<T>(name: string, overrides: T): T & Node {
  return {
    name,
    next: [],
    prev: [],
    nextText: [],
    dependsOn: [],
    getKey,
    ...overrides,
  };
}

function getKey(this: Gate): string {
  return this.dependsOn
    .flatMap((g) => {
      if (g.kind === "flp") return [g.stateHigh ? "1" : "0"];
      if (g.kind === "con") return g.signalsIn.map((s) => (s ? "1" : "0"));
      return [];
    })
    .join("");
}

const unique = <T>(arr: T[]) => [...new Set(arr)];

function parse(input: string) {
  const gates = input.split("\n").map<Gate>((line) => {
    const [symbol, connected] = line.split(" -> ");
    const nextText = connected.split(", ");
    const name = symbol.substring(1);

    if (symbol.startsWith("%")) {
      return newGate(name, { kind: "flp", nextText, stateHigh: false });
    }
    if (symbol.startsWith("&")) {
      return newGate(name, { kind: "con", nextText, signalsIn: [] });
    }
    if (symbol === "broadcaster") {
      return newGate(symbol, { kind: "bbc", nextText });
    }

    throw new Error(`Unknown gate: ${symbol}`);
  });

  gates.push(newGate("button", { kind: "btn", nextText: ["broadcaster"] }));

  const gatesNames = {
    inc: unique(gates.flatMap(({ name }) => name)),
    out: unique(gates.flatMap(({ nextText }) => nextText)),
  };

  gatesNames.out
    .filter((it) => !gatesNames.inc.includes(it))
    .map<Out>((name) => newGate(name, { kind: "out" }))
    .forEach((gate) => gates.push(gate));

  const gatesByName = new Map<string, Gate>();
  gates.forEach((gate) => gatesByName.set(gate.name, gate));

  // connect gates
  gates.forEach((gate) => {
    gate.next = gate.nextText.map((name) => gatesByName.get(name)!);
    gate.next.forEach((next) => next.prev.push(gate));
  });

  // initialize signals
  gates.forEach((gate) => {
    if (gate.kind === "con") gate.signalsIn = gate.prev.map(() => false);
  });

  gates.forEach((gate) => {
    const dependsOn = new Set<Gate>();
    const process: Gate[] = [gate];

    while (process.length) {
      const gate = process.shift()!;
      gate.prev.forEach((prev) => {
        if (!dependsOn.has(prev)) {
          dependsOn.add(prev);
          process.push(prev);
        }
      });
    }

    gate.dependsOn = [...dependsOn].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  });

  return { gatesByName, gates };
}

type Result = { high: Gate[]; low: Gate[] };

function processPulse(gate: Gate, pulseHigh: boolean, from?: Gate): Result {
  if (gate.kind === "flp") {
    if (!pulseHigh) {
      gate.stateHigh = !gate.stateHigh;
      return gate.stateHigh
        ? { high: [...gate.next], low: [] }
        : { high: [], low: [...gate.next] };
    } else {
      return { high: [], low: [] };
    }
  }

  if (gate.kind === "con") {
    const fromIndex = gate.prev.indexOf(from!);
    gate.signalsIn[fromIndex] = pulseHigh;

    if (gate.signalsIn.every((signal) => signal)) {
      return { high: [], low: [...gate.next] };
    } else {
      return { high: [...gate.next], low: [] };
    }
  }

  if (gate.kind === "bbc") {
    return pulseHigh
      ? { high: [...gate.next], low: [] }
      : { high: [], low: [...gate.next] };
  }

  if (gate.kind === "btn") {
    return { high: [], low: [...gate.next] };
  }

  if (gate.kind === "out") {
    return { high: [], low: [] };
  }

  throw new Error(`Unknown gate: ${gate}`);
}

export function solvePart1(input: string): number {
  const { gatesByName } = parse(input);
  const button = gatesByName.get("button") as Btn;
  let press = 0;
  let pulsesHigh = 0;
  let pulsesLow = 0;

  while (press++ < 1000) {
    const process: Array<{ from?: Gate; result: Result }> = [
      { result: { high: [], low: [button] } },
    ];

    while (process.length) {
      const { from, result } = process.shift()!;

      result.low.forEach((gate) => {
        const res = processPulse(gate, false, from);
        pulsesHigh += res.high.length;
        pulsesLow += res.low.length;
        process.push({ from: gate, result: res });
      });

      result.high.forEach((gate) => {
        const res = processPulse(gate, true, from);
        pulsesHigh += res.high.length;
        pulsesLow += res.low.length;
        process.push({ from: gate, result: res });
      });
    }
  }

  return pulsesHigh * pulsesLow;
}
export function solvePart2(input: string): number {
  const { gatesByName } = parse(input);
  const button = gatesByName.get("button") as Btn;
  const rx = gatesByName.get("rx") as Out;

  if (!rx) return -1;

  // assumes that rx is connected from a con gate, which inputs we will be examining
  const prevOfPrevRx = rx.prev[0]!.prev.map((gate) => ({ gate, cycle: 0 }));

  const states = prevOfPrevRx.map(({ gate }) => {
    const cache = new Map<string, number>();
    cache.set(gate.getKey!(), 0);
    return cache;
  });

  let press = 0;
  while (++press) {
    const process: Array<{ from?: Gate; result: Result }> = [
      { result: { high: [], low: [button] } },
    ];

    while (process.length) {
      const { from, result } = process.shift()!;

      result.low.forEach((gate) =>
        process.push({ from: gate, result: processPulse(gate, false, from) })
      );

      result.high.forEach((gate) =>
        process.push({ from: gate, result: processPulse(gate, true, from) })
      );
    }
    prevOfPrevRx.map(({ gate, cycle }, i) => {
      const key = gate.getKey!();
      const cache = states[i];

      if (cache.has(key) && cycle === 0) {
        prevOfPrevRx[i].cycle = press - cache.get(key)!;
      } else {
        cache.set(key, press);
      }
    });

    if (prevOfPrevRx.every(({ cycle }) => cycle > 0)) {
      return lcmOf(prevOfPrevRx.map((it) => it.cycle));
    }
  }

  return press;
}
