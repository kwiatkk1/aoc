import chalk from "chalk";
import { Board, BoardNode, Direction } from "../../../utils/board";
import { debugStep } from "../../../utils/debug";

type Tile = {
  hasRobot: boolean;
  isWall: boolean;
  hasBox: boolean;
  hasBoxPartL: boolean;
  hasBoxPartR: boolean;
};

const sum = (a: number, b: number) => a + b;

function printTile(it: Tile) {
  if (it.isWall) return chalk.white("#");
  if (it.hasRobot) return chalk.greenBright("@");
  if (it.hasBox) return "O";
  if (it.hasBoxPartL) return "[";
  if (it.hasBoxPartR) return "]";
  return chalk.gray(".");
}

function parseTile({ char }: { char: string }): Tile {
  return {
    isWall: char === "#",
    hasRobot: char === "@",
    hasBox: char === "O",
    hasBoxPartL: char === "[",
    hasBoxPartR: char === "]",
  };
}

function expandHorizontally(boardRaw: string) {
  return boardRaw
    .split("")
    .map((char) => {
      if (char === "@") return "@.";
      if (char === "O") return "[]";
      if (char === "\n") return "\n";
      return char.repeat(2);
    })
    .join("");
}

function hasBox({ value }: BoardNode<Tile>) {
  return value.hasBox || value.hasBoxPartL || value.hasBoxPartR;
}

function parse(input: string, { expand = false } = {}) {
  const [boardRaw, instructions] = input.split("\n\n");
  const boardInput = expand ? expandHorizontally(boardRaw) : boardRaw;
  const board = Board.from(boardInput, parseTile);

  const commands = instructions
    .split("\n")
    .join("")
    .split("")
    .map((char): Direction => {
      if (char === "^") return "U";
      if (char === "v") return "D";
      if (char === "<") return "L";
      return "R";
    });

  return { board, commands };
}

function moveRobot(cmd: Direction, board: Board<Tile>) {
  const nextNode = ({ links }: BoardNode<Tile>) => links[cmd]!.node;
  const robotNode = board.find(({ value }) => value.hasRobot)!;
  const maybeNext = nextNode(robotNode);

  if (maybeNext.value.isWall) return;

  // moving to an empty cell
  if (!hasBox(maybeNext)) {
    robotNode.value.hasRobot = false;
    maybeNext.value.hasRobot = true;
    return;
  }

  const boxesToPush = new Set<BoardNode<Tile>>();

  if (hasBox(maybeNext)) boxesToPush.add(maybeNext);
  if (maybeNext.value.hasBoxPartL) boxesToPush.add(maybeNext.links.R!.node);
  if (maybeNext.value.hasBoxPartR) boxesToPush.add(maybeNext.links.L!.node);

  let oldSize = 0;

  while (oldSize < boxesToPush.size) {
    oldSize = boxesToPush.size;

    boxesToPush.forEach((it) => {
      const next = nextNode(it);

      if (next.value.isWall) return;
      if (next.value.hasBoxPartL || next.value.hasBoxPartR) {
        boxesToPush.add(next);
        boxesToPush.add(next.value.hasBoxPartL ? next.links.R!.node : next.links.L!.node);
      }
      if (next.value.hasBox) {
        boxesToPush.add(next);
      }
    });
  }

  const pushedList = [...boxesToPush];

  if (pushedList.some((it) => nextNode(it).value.isWall)) return;

  // move robot
  robotNode.value.hasRobot = false;
  maybeNext.value.hasRobot = true;

  // remember positions of boxes
  const prevL = pushedList.filter(({ value }) => value.hasBoxPartL);
  const prevR = pushedList.filter(({ value }) => value.hasBoxPartR);
  const prevF = pushedList.filter(({ value }) => value.hasBox);

  // clear previous tiles
  boxesToPush.forEach(({ value }) => {
    value.hasBoxPartL = false;
    value.hasBoxPartR = false;
    value.hasBox = false;
  });

  // place boxes on new tiles
  prevL.map(nextNode).forEach(({ value }) => (value.hasBoxPartL = true));
  prevR.map(nextNode).forEach(({ value }) => (value.hasBoxPartR = true));
  prevF.map(nextNode).forEach(({ value }) => (value.hasBox = true));
}

function printStep(board: Board<Tile>, commands: Direction[], i: number) {
  const prevCommand = commands[i];
  const nextCommand = commands[i + 1];

  console.log(
    chalk.gray("after"),
    prevCommand,
    chalk.gray(`(${chalk.yellow(i + 1)} of ${chalk.yellow(commands.length)})`),
    chalk.gray("next"),
    nextCommand || chalk.redBright("END")
  );
  board.print(printTile);
  console.log("");
}

async function solve(input: string, { expand = false } = {}) {
  const { board, commands } = parse(input, { expand });

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];

    await debugStep({
      step: () => moveRobot(command, board),
      print: () => printStep(board, commands, i),
    });
  }

  return board
    .filter((it) => it.value.hasBoxPartL || it.value.hasBox)
    .map((it) => it.row * 100 + it.col)
    .reduce(sum, 0);
}

export function solvePart1(input: string) {
  return solve(input, { expand: false });
}

export async function solvePart2(input: string) {
  return solve(input, { expand: true });
}
