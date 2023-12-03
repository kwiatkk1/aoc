type Node = {
  col: number;
  row: number;
  value: string;
  isSymbol: boolean;
  isEmpty: boolean;
  isNumber: boolean;
  adjacent: Node[];
};

type Board = Node[][];

function parse(input: string): Board {
  const board = input.split("\n").map((row, y) =>
    row.split("").map((value, x): Node => {
      const isNumber = value >= "0" && value <= "9";
      const isEmpty = value === ".";
      const isSymbol = !isNumber && !isEmpty;

      return {
        col: x,
        row: y,
        value,
        isEmpty,
        isSymbol,
        isNumber,
        adjacent: [] as Node[],
      };
    })
  );

  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      const node = board[y][x];
      const possibleAdjacent = [board[y]?.[x - 1], board[y]?.[x + 1]];
      node.adjacent = possibleAdjacent.filter((it) => it && it.isNumber);
    }
  }

  return board;
}

function getSymbolsWithNumbers(input: string) {
  const board = parse(input);
  const symbols = board.flatMap((row) => row.filter((cell) => cell.isSymbol));

  return symbols.map((symbolNode) => {
    const { col: x, row: y } = symbolNode;
    const toSearch = [
      ...(board[y - 1]?.[x]?.isNumber
        ? [board[y - 1][x]]
        : [board[y - 1]?.[x - 1], board[y - 1]?.[x + 1]]),
      board[y]?.[x - 1],
      board[y]?.[x + 1],
      ...(board[y + 1]?.[x]?.isNumber
        ? [board[y + 1][x]]
        : [board[y + 1]?.[x - 1], board[y + 1]?.[x + 1]]),
    ].filter((node) => node && node.isNumber);

    const numbers = toSearch.map((start) => {
      const collected = [start];
      const toVisit = [...start.adjacent];
      let node = toVisit.pop();

      while (node) {
        if (!collected.includes(node)) {
          collected.push(node);
          toVisit.push(...node.adjacent);
        }
        node = toVisit.pop();
      }

      return parseInt(
        collected
          .sort((a, b) => a.col - b.col)
          .map((it) => it.value)
          .join("")
      );
    });

    return { symbol: symbolNode, numbers };
  });
}

export function solvePart1(input: string): number {
  const connected = getSymbolsWithNumbers(input);

  return connected
    .flatMap((it) => it.numbers)
    .reduce((sum, number) => sum + number, 0);
}

export function solvePart2(input: string): number {
  const connected = getSymbolsWithNumbers(input);

  return connected
    .filter((it) => it.symbol.value === "*" && it.numbers.length === 2)
    .map((it) => it.numbers.reduce((acc, num) => acc * num, 1))
    .reduce((sum, number) => sum + number, 0);
}
