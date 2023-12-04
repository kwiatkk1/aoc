type Game = {
  card: number;
  winning: number[];
  numbers: number[];
};

function parse(input: string): Game[] {
  return input.split("\n").map((line) => {
    const [cardText, numbersText] = line.split(":");
    const card = parseInt(cardText.split(/\s+/)[1]);
    const [winningText, mNumbersText] = numbersText
      .split("|")
      .map((it) => it.trim());
    return {
      card,
      winning: winningText.split(/\s+/).map((n) => parseInt(n)),
      numbers: mNumbersText.split(/\s+/).map((n) => parseInt(n)),
    };
  });
}

function getScore(game: Game): number {
  const winning = [...game.winning].sort((a, b) => a - b);
  const numbers = [...game.numbers].sort((a, b) => a - b);
  const found = [];
  let i = 0,
    j = 0;

  while (i < winning.length && j < numbers.length) {
    if (winning[i] === numbers[j]) {
      found.push(winning[i]);
      i += 1;
      j += 1;
    } else if (winning[i] < numbers[j]) {
      i += 1;
    } else {
      j += 1;
    }
  }

  return found.length;
}

export function solvePart1(input: string): number {
  return parse(input)
    .map(getScore)
    .reduce((sum, score) => sum + (score ? Math.pow(2, score - 1) : 0), 0);
}
export function solvePart2(input: string): number {
  const games = parse(input).map((game) => ({
    game,
    score: getScore(game),
    count: 1,
  }));

  for (let { game, score, count } of games) {
    for (let i = game.card; i < game.card + score && i < games.length; i++) {
      games[i].count += count;
    }
  }

  return games.reduce((sum, { score, count }) => sum + count, 0);
}
