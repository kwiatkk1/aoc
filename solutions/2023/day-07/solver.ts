import { countBy } from "lodash";

type Card = string;
type Rule = (counts: CardCount[]) => CardArrangement | null;

enum CardArrangement {
  HIGH_CARD = 1,
  ONE_PAIR,
  TWO_PAIR,
  THREE_OF_KIND,
  FULL_HOUSE,
  FOUR_OF_KIND,
  FIVE_OF_KIND,
}

type CardCount = { card: Card; count: number };

type Line = {
  bid: number;
  hand: Card[];
  counts: CardCount[];
};

type Score = {
  arrangement: CardArrangement;
  orderValue: number;
};

function parse(input: string): Line[] {
  return input.split("\n").map((line): Line => {
    const [handText, bidText] = line.split(" ");
    const hand = handText.split("");

    return {
      hand,
      bid: parseInt(bidText),
      counts: Object.entries(countBy(hand)).map(([card, count]) => ({
        card,
        count,
      })) as CardCount[],
    };
  });
}

function getScore({
  line,
  cards,
  rules,
}: {
  line: Line;
  cards: Card[];
  rules: Rule[];
}): Score {
  for (let getArrangement of rules) {
    const arrangement = getArrangement(line.counts);

    if (arrangement) {
      return {
        arrangement,
        orderValue: [...line.hand]
          .reverse()
          .reduce(
            (score, card, i) =>
              score + (cards.indexOf(card) + 1) * Math.pow(100, i),
            0
          ),
      };
    }
  }
  return { arrangement: 0, orderValue: 0 };
}

function solve(input: string, cards: Card[], rules: Rule[]): number {
  return parse(input)
    .map((line) => ({ line, score: getScore({ line, cards, rules }) }))
    .sort(
      ({ score: a }, { score: b }) =>
        a.arrangement - b.arrangement || a.orderValue - b.orderValue
    )
    .map(({ line }, index) => line.bid * (index + 1))
    .reduce((sum, score) => sum + score, 0);
}

export function solvePart1(input: string): number {
  const availableCards = "23456789TJQKA".split("");
  const rules: Array<Rule> = [
    (counts) => {
      const has5 = !!counts.find(({ count }) => count === 5);
      return has5 ? CardArrangement.FIVE_OF_KIND : null;
    },
    (counts) => {
      const has4 = !!counts.find(({ count }) => count === 4);
      return has4 ? CardArrangement.FOUR_OF_KIND : null;
    },
    (counts) => {
      const has3 = !!counts.find(({ count }) => count === 3);
      const has2 = !!counts.find(({ count }) => count === 2);
      return has3 && has2 ? CardArrangement.FULL_HOUSE : null;
    },
    (counts) => {
      const has3 = !!counts.find(({ count }) => count === 3);
      return has3 ? CardArrangement.THREE_OF_KIND : null;
    },
    (counts) => {
      const has2pairs = counts.filter(({ count }) => count === 2).length === 2;
      return has2pairs ? CardArrangement.TWO_PAIR : null;
    },
    (counts) => {
      const has2 = !!counts.find(({ count }) => count === 2);
      return has2 ? CardArrangement.ONE_PAIR : null;
    },
    () => {
      return CardArrangement.HIGH_CARD;
    },
  ];

  return solve(input, availableCards, rules);
}

export function solvePart2(input: string): number {
  const availableCards = "J23456789TQKA".split("");
  const rules: Array<Rule> = [
    (counts) => {
      const has5 = !!counts.find(({ count }) => count === 5);
      return has5 ? CardArrangement.FIVE_OF_KIND : null;
    },
    (counts) => {
      const group4 = counts.find(({ count }) => count === 4)!;
      const group1 = counts.find(({ count }) => count === 1)!;
      const has4 = !!group4;

      if (!has4) return null;

      return group4.card === "J" || group1.card === "J"
        ? CardArrangement.FIVE_OF_KIND
        : CardArrangement.FOUR_OF_KIND;
    },
    (counts) => {
      const group3 = counts.find(({ count }) => count === 3)!;
      const group2 = counts.find(({ count }) => count === 2)!;
      const hasFull = Boolean(group3 && group2);

      if (!hasFull) return null;

      return group3.card === "J" || group2.card === "J"
        ? CardArrangement.FIVE_OF_KIND
        : CardArrangement.FULL_HOUSE;
    },
    (counts) => {
      const group3 = counts.find(({ count }) => count === 3)!;
      const rest = counts.filter(({ count }) => count === 1);
      const has3 = !!group3;

      if (!has3) return null;

      return group3.card === "J" || rest.find(({ card }) => card === "J")
        ? CardArrangement.FOUR_OF_KIND
        : CardArrangement.THREE_OF_KIND;
    },
    (counts) => {
      const groups2 = counts.filter(({ count }) => count === 2);
      const group1 = counts.find(({ count }) => count === 1)!;
      const has2Pairs = groups2.length === 2;

      if (!has2Pairs) return null;

      if (groups2.find(({ card }) => card === "J")) {
        return CardArrangement.FOUR_OF_KIND;
      }
      if (group1.card === "J") {
        return CardArrangement.FULL_HOUSE;
      }

      return CardArrangement.TWO_PAIR;
    },
    (counts) => {
      const pair = counts.find(({ count }) => count === 2);
      const rest = counts.filter(({ count }) => count === 1);

      if (!pair) return null;

      if (pair.card === "J" || rest.map(({ card }) => card).includes("J")) {
        return CardArrangement.THREE_OF_KIND;
      }

      return CardArrangement.ONE_PAIR;
    },
    (counts) => {
      if (counts.some(({ card }) => card === "J")) {
        return CardArrangement.ONE_PAIR;
      }

      return CardArrangement.HIGH_CARD;
    },
  ];

  return solve(input, availableCards, rules);
}
