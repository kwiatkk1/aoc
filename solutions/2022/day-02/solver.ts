function parse(input: string) {}

export function solvePart1(input: string): string | number {
  const model = parse(input);
  return "";
}

export function solvePart2(input: string): string | number {
  type Pick = "rock" | "paper" | "scissors";
  type ElfPick = "A" | "B" | "C";
  type StrategyPick = "X" | "Y" | "Z";

  const elvesMap: Record<ElfPick, Pick> = {
    A: "rock",
    B: "paper",
    C: "scissors",
  };

  const guessedMap: Record<StrategyPick, Pick> = {
    X: "rock",
    Y: "paper",
    Z: "scissors",
  };

  const resultWonMap: Record<Pick, Pick> = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };
  const resultLostMap: Record<Pick, Pick> = {
    rock: "paper",
    paper: "scissors",
    scissors: "rock",
  };

  const scoreMap = {
    rock: 1,
    paper: 2,
    scissors: 3,
  };

  const strategyMap = {
    X: -1,
    Y: 0,
    Z: 1,
  };

  function getResultScore(opponentPick: Pick, myPick: Pick) {
    if (opponentPick === myPick) return 3;
    return resultWonMap[myPick] === opponentPick ? 6 : 0;
  }

  function getShape(opponentPick: Pick, result: number): Pick {
    if (result === 0) return opponentPick;

    const winningPick = resultLostMap[opponentPick];
    const loosingPick = resultWonMap[opponentPick];

    if (result > 0) return winningPick;
    return loosingPick;
  }

  function calculateScore(a: ElfPick, b: StrategyPick, map = guessedMap) {
    const opponentPick = elvesMap[a];
    const myPick = getShape(opponentPick, strategyMap[b]);

    const pickScore = scoreMap[myPick];
    const resultScore = getResultScore(opponentPick, myPick);

    return pickScore + resultScore;
  }

  const rounds = input
    .split("\n")
    .map((line) => line.split(" "))
    .map(([playerA, playerB]) => ({ playerA, playerB })) as Array<{
    playerA: ElfPick;
    playerB: StrategyPick;
  }>;

  const result = rounds
    .map(({ playerA, playerB }) => {
      const score = calculateScore(playerA, playerB);
      return { playerA, playerB, score };
    })
    .reduce((sum, n) => sum + n.score, 0);

  return result;
}
