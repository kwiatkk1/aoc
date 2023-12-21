type Node = {
  row: number;
  col: number;
  type: string;
  neighbors: Node[];
  activated: boolean;
  odd: boolean;
};

function parse(input: string) {
  const nodes = input.split("\n").map((line, row) =>
    line.split("").map<Node>((char, col) => ({
      row,
      col,
      type: char,
      neighbors: [],
      activated: false,
      odd: false,
    }))
  );

  // link nodes
  nodes.flat().forEach((node) => {
    const { row, col } = node;
    const neighbors: Node[] = [];
    neighbors.push(nodes[row - 1]?.[col]);
    neighbors.push(nodes[row + 1]?.[col]);
    neighbors.push(nodes[row]?.[col - 1]);
    neighbors.push(nodes[row]?.[col + 1]);
    node.neighbors = neighbors.filter((n) => n && n.type !== "#");
  });

  return {
    nodes: nodes
      .flat()
      .filter((n) => n.type !== "#")
      .filter((n) => n.neighbors.length > 0),
    size: nodes.length,
  };
}

function fromCenter(input: string, step: number) {
  const { size } = parse(input);
  const center = (size - 1) / 2;
  return fromPoint(input, step, center, center);
}

function fromEast(input: string, step: number) {
  const { size } = parse(input);
  const center = (size - 1) / 2;
  return fromPoint(input, step, center, size - 1);
}

function fromWest(input: string, step: number) {
  const { size } = parse(input);
  const center = (size - 1) / 2;
  return fromPoint(input, step, center, 0);
}

function fromNorth(input: string, step: number) {
  const { size } = parse(input);
  const center = (size - 1) / 2;
  return fromPoint(input, step, 0, center);
}

function fromSouth(input: string, step: number) {
  const { size } = parse(input);
  const center = (size - 1) / 2;
  return fromPoint(input, step, size - 1, center);
}

function fromNorthEast(input: string, step: number) {
  const { size } = parse(input);
  return fromPoint(input, step, 0, size - 1);
}

function fromNorthWest(input: string, step: number) {
  return fromPoint(input, step, 0, 0);
}

function fromSouthWest(input: string, step: number) {
  const { size } = parse(input);
  return fromPoint(input, step, size - 1, 0);
}

function fromSouthEast(input: string, step: number) {
  const { size } = parse(input);
  return fromPoint(input, step, size - 1, size - 1);
}

function fromPoint(input: string, step: number, row: number, col: number) {
  const { nodes } = parse(input);
  const start = nodes.find((node) => node.row === row && node.col === col)!;
  let activeCount = 0;
  start.activated = true;
  start.odd = true;

  let round = 0;
  while (nodes.some((n) => !n.activated)) {
    const previouslyVisited = nodes.filter((n) => n.activated);

    previouslyVisited.forEach((node) => {
      node.neighbors
        .filter((n) => n.type !== "#" && !n.activated)
        .forEach((n) => {
          n.activated = true;
          n.odd = !node.odd;
        });
    });

    round++;

    if (round === step) {
      activeCount = nodes.filter(
        (n) => n.activated && (round % 2 ? !n.odd : n.odd)
      ).length;
    }
  }

  const rest = step - round;

  if (!activeCount) {
    activeCount = nodes.filter(
      (n) => n.activated && (rest % 2 ? !n.odd : n.odd)
    ).length;
  }

  return {
    active: step === 0 ? 1 : activeCount,
    fullAt: round,
    odd: nodes.filter((n) => n.activated && n.odd).length,
    even: nodes.filter((n) => n.activated && !n.odd).length,
  };
}

export function solvePart1(input: string): number {
  const { nodes } = parse(input);
  const maxRound = nodes.length < 1e4 ? 6 : 64;
  return fromCenter(input, maxRound).active;
}

export function solvePart2(input: string): number {
  const steps = 26501365;
  const { size } = parse(input);

  const toHalf = Math.floor(size / 2);
  const stepsFromLineStart = steps - toHalf;
  const blocksLineAll = Math.ceil(stepsFromLineStart / size);
  const startedRounds = Math.max(0, Math.floor((steps - 1) / size));
  const blockDiagAll = ((startedRounds + 1) / 2) * startedRounds;

  const {
    fullAt,
    odd: activeOnOdd,
    even: activeOnEven,
  } = fromEast(input, steps);

  const blockLineFilled = Math.max(
    0,
    Math.ceil((stepsFromLineStart - fullAt) / size)
  );

  const blocksDiagLow = Math.max(0, Math.floor((steps - 1) / size));
  const blocksDiagHigh = Math.max(0, blocksDiagLow - 1);
  const blocksDiagFilled = blockDiagAll - blocksDiagLow - blocksDiagHigh;

  const isPhaseOdd = steps % 2 === 0;

  const active = {
    inPhase: isPhaseOdd ? activeOnOdd : activeOnEven,
    notInPhase: isPhaseOdd ? activeOnEven : activeOnOdd,
  };

  const lineBlocksInPhase = Math.ceil(blockLineFilled / 2);

  const n = (-1 + Math.pow(1 + 8 * blocksDiagFilled, 0.5)) / 2;
  const diagInPhase = Math.pow(Math.floor((n + 1) / 2), 2);
  const diagNotPhase = blocksDiagFilled - diagInPhase;

  // start collecting active counts... from central block
  let activeCount = fromCenter(input, steps).active;

  //  from completely filled boards in h/v lines
  activeCount += 4 * (active.inPhase * lineBlocksInPhase);
  activeCount +=
    4 * (active.notInPhase * (blockLineFilled - lineBlocksInPhase));

  // from completely filled boards in diagonal
  activeCount +=
    4 * (active.inPhase * diagNotPhase + active.notInPhase * diagInPhase);

  if (blocksLineAll > blockLineFilled) {
    const stepsToFilled = blockLineFilled * size + toHalf;
    const step = steps - stepsToFilled - 1;

    activeCount += fromEast(input, step).active;
    activeCount += fromWest(input, step).active;
    activeCount += fromNorth(input, step).active;
    activeCount += fromSouth(input, step).active;

    if (step >= size) {
      activeCount += fromEast(input, step - size).active;
      activeCount += fromWest(input, step - size).active;
      activeCount += fromNorth(input, step - size).active;
      activeCount += fromSouth(input, step - size).active;
    }
  }

  if (blockDiagAll > blocksDiagFilled) {
    const step = (steps - 1) % size;

    if (blocksDiagLow) {
      activeCount += blocksDiagLow * fromNorthEast(input, step).active;
      activeCount += blocksDiagLow * fromNorthWest(input, step).active;
      activeCount += blocksDiagLow * fromSouthEast(input, step).active;
      activeCount += blocksDiagLow * fromSouthWest(input, step).active;
    }

    if (blocksDiagHigh) {
      activeCount += blocksDiagHigh * fromNorthEast(input, step + size).active;
      activeCount += blocksDiagHigh * fromNorthWest(input, step + size).active;
      activeCount += blocksDiagHigh * fromSouthEast(input, step + size).active;
      activeCount += blocksDiagHigh * fromSouthWest(input, step + size).active;
    }
  }

  return activeCount;
}
