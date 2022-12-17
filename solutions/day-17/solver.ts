const rocksInput = `####

.#.
###
.#.

..#
..#
###

#
#
#
#

##
##`;

class Rock {
  constructor(public pattern: boolean[][]) {}

  height() {
    return this.pattern.length;
  }

  width() {
    return this.pattern[0].length;
  }

  static fromText(text: string) {
    const rows = text.split("\n");
    const cols = rows.map((row) => row.split("").map((chat) => chat === "#"));
    return new Rock(cols);
  }
}

class MovingRock extends Rock {
  position: { x: number; y: number } = { x: 2, y: 0 };

  moveSide(direction: number) {
    this.position.x += direction > 0 ? 1 : -1;
  }

  moveDown(by: number) {
    this.position.y += by;
  }
}

class RockStream {
  i: number = 0;
  constructor(public rocks: Rock[]) {}

  getNext(): MovingRock {
    const next = this.rocks[this.i];
    this.i = (this.i + 1) % this.rocks.length;
    return new MovingRock(next.pattern);
  }
}

class WindStream {
  current: number = 0;
  pattern: number[];
  constructor(text: string) {
    this.current = 0;
    this.pattern = text.split("").map((c) => (c === "<" ? -1 : 1));
  }

  getWind() {
    const wind = this.pattern[this.current];
    this.current = (this.current + 1) % this.pattern.length;
    return wind;
  }
}

const MIN_SPAN = 3;
const BOARD_WIDTH = 7;

class Game {
  rocksCount: number = 0;
  towerHeight: number = 0;
  trimmedHeight: number = 0;
  board: boolean[][] = [];
  activeRock: MovingRock | null = null;
  hash: string = this.getHash();

  constructor(public rockStream: RockStream, public windStream: WindStream) {}

  get boardHeight() {
    return this.board.length;
  }

  get totalTowerHeight() {
    return this.towerHeight + this.trimmedHeight;
  }

  tick() {
    if (!this.activeRock) this.putRockOnBoard();

    const wind = this.windStream.getWind();
    if (this.canMove({ byX: wind })) {
      this.activeRock?.moveSide(wind);
    }

    if (this.canMove({ byY: 1 })) {
      this.activeRock?.moveDown(1);
    } else {
      this.placeRock();
    }
  }

  putRockOnBoard() {
    this.activeRock = this.rockStream.getNext();
    const newBoardHeight =
      this.towerHeight + MIN_SPAN + this.activeRock.height();

    if (this.boardHeight < newBoardHeight) {
      this.extendBoard(newBoardHeight - this.boardHeight);
    }
  }

  placeRock() {
    const { activeRock } = this;
    if (activeRock) {
      activeRock.pattern.forEach((row, i) => {
        row.forEach((col, j) => {
          if (col) {
            this.board[i + activeRock.position.y][j + activeRock.position.x] =
              true;
          }
        });
      });
      this.activeRock = null;
      this.rocksCount += 1;
      this.shrinkBoard();
    }
  }

  extendBoard(by: number) {
    this.board.unshift(
      ...Array(by)
        .fill("")
        .map(() => Array(BOARD_WIDTH).fill(false) as boolean[])
    );
  }

  shrinkBoard() {
    const firstRowNonEmpty = this.board.findIndex((row) =>
      row.some((col) => !!col)
    );

    if (firstRowNonEmpty > -1) {
      this.board = this.board.slice(firstRowNonEmpty);
      this.towerHeight = this.board.length;
    }

    const lastSignificantRow = Math.max(
      ...this.board[0].map((_, i) => {
        return this.board.findIndex((row) => row[i]);
      })
    ) + 5;

    if (lastSignificantRow < this.board.length) {
      const height = this.board.length;
      this.board = this.board.slice(0, lastSignificantRow + 1);
      this.towerHeight = this.board.length;
      this.trimmedHeight = this.trimmedHeight + (height - this.board.length);
    }

    this.hash = this.getHash();
  }

  getHash() {
    return `${this.rockStream.i}|${this.windStream.current}|${this.board
      .map((it) => it.map((it) => (it ? "#" : ".")).join(""))
      .join("x")}`;
  }

  canMove({ byX = 0, byY = 0 }: { byX?: number; byY?: number }) {
    const { activeRock } = this;
    if (!activeRock) return false;
    const startX = activeRock.position.x + byX;
    const startY = activeRock.position.y + byY;

    const mask = activeRock.pattern.map((row, y) =>
      row.map((col, x) => {
        const newX = startX + x;
        const newY = startY + y;
        if (newY >= this.boardHeight) return true;
        if (newX < 0 || newX >= BOARD_WIDTH) return true;
        return this.board[newY][newX];
      })
    );

    for (let i = 0; i < mask.length; i++) {
      for (let j = 0; j < mask[i].length; j++) {
        if (mask[i][j] && activeRock.pattern[i][j]) return false;
      }
    }

    return true;
  }

  print() {
    console.log(
      this.board
        .map((row) => row.map((it) => (it ? "#" : ".")).join(""))
        .join("\n")
    );
  }
}

function parseRocks(input: string): Rock[] {
  return input.split("\n\n").map((rockInput) => Rock.fromText(rockInput));
}

function solve(input: string, maxRocksCount: number) {
  const windStream = new WindStream(input);
  const rockStream = new RockStream(parseRocks(rocksInput));
  const game = new Game(rockStream, windStream);

  const hashes: Array<{
    hash: string;
    rocksCount: number;
    totalHeight: number;
  }> = [];
  let currentCount = 0;

  while (true) {
    game.tick();

    if (game.rocksCount > currentCount) {
      if (hashes.find(({ hash }) => hash === game.hash)) {
        // console.log('start', hashes.find(({ hash }) => hash === game.hash));
        // console.log('this', {
        //   hash: game.hash,
        //   rocksCount: game.rocksCount,
        //   totalHeight: game.totalTowerHeight,
        // });

        hashes.push({
          hash: game.hash,
          rocksCount: game.rocksCount,
          totalHeight: game.totalTowerHeight,
        });
        break;
      }
      hashes.push({
        hash: game.hash,
        rocksCount: game.rocksCount,
        totalHeight: game.totalTowerHeight,
      });
      currentCount = game.rocksCount;
    }
  }

  // cycle
  const startAt = hashes.find(({ hash }) => hash === game.hash)!;
  const startAtCount = startAt.rocksCount;
  const startCount = startAtCount;
  const cycleLength = game.rocksCount - startAt.rocksCount;
  const cycleHeight = game.totalTowerHeight - startAt.totalHeight;
  const cyclesCount = Math.floor((maxRocksCount - startCount) / cycleLength);
  const cycleHeightTotal = cyclesCount * cycleHeight;

  // base
  const base = hashes.find(
    ({ rocksCount }) => rocksCount === startAt.rocksCount - 1
  )!;
  const baseHeight = base.totalHeight;

  // extra
  const extraCount =
    maxRocksCount - base.rocksCount - cyclesCount * cycleLength;
  const extraHeight = !extraCount
    ? 0
    : hashes.find(
        ({ rocksCount }) => rocksCount === base.rocksCount + extraCount
      )!.totalHeight - base.totalHeight;

  console.log(
    JSON.stringify({
      baseHeight,

      cycleStart: startAtCount,
      cycleLength,
      cyclesCount,
      cycleHeight,
      cycleHeightTotal,

      extra: extraCount,
      extraHeight,
    })
  );

  const r = maxRocksCount - cyclesCount * cycleLength;
  return (
    cycleHeightTotal +
    hashes.find(({ rocksCount }) => rocksCount === r)!.totalHeight
  );
  // return

  return baseHeight + cycleHeightTotal + extraHeight;
  // return cycleHeightTotal + hashes[startIndex + extraCount - 1].height;
}

export function solvePart1(input: string): number {
  // return solve(input, 2022);
  const windStream = new WindStream(input);
  const rockStream = new RockStream(parseRocks(rocksInput));
  const game = new Game(rockStream, windStream);

  while (true) {
    game.tick();

    if (game.rocksCount === 2022) {
      game.print();
      console.log(game.towerHeight, game.trimmedHeight);
      return game.totalTowerHeight;
    }
  }
}

export function solvePart2(input: string): number {
  return solve(input, 1e12);
}
