import { Board } from "../../../utils/board";

type Tile = {
  isStart: boolean;
  isSplit: boolean;
  hasBeam: boolean;
  hadBeam: boolean;
  pathCnt: number;
};

function parseTile({ char }: { char: string }): Tile {
  return {
    isStart: char === "S",
    isSplit: char === "^",
    hasBeam: char === "S",
    hadBeam: char === "S",
    pathCnt: char === "S" ? 1 : 0,
  };
}

function parse(input: string) {
  const board = Board.from(input, parseTile);

  for (let row = 1; row < board.height; row++) {
    const prevBeam = board.filter(
      (it) => it.row === row - 1 && it.value.hasBeam
    );
    const rowNodes = board.filter((it) => it.row === row);

    prevBeam.forEach((beamed) => {
      const node = beamed.links.D?.node;
      if (node) {
        node.value.hasBeam = true;
        node.value.pathCnt = beamed.value.pathCnt;
      }
    });

    rowNodes
      .filter((it) => it.value.hasBeam && it.value.isSplit)
      .forEach((rowNode) => {
        const nodeL = rowNode.links.L?.node;
        const nodeR = rowNode.links.R?.node;
        if (nodeL) {
          nodeL.value.hasBeam = true;
          nodeL.value.pathCnt += rowNode.value.pathCnt;
        }
        if (nodeR) {
          nodeR.value.hasBeam = true;
          nodeR.value.pathCnt += rowNode.value.pathCnt;
        }
        rowNode.value.hadBeam = true;
        rowNode.value.hasBeam = false;
      });
  }

  return board;
}

export function solvePart1(input: string): number {
  const board = parse(input);

  // board.print((it) => {
  //   if (it.isStart) return "S";
  //   if (it.isSplit) return "^";
  //   if (it.hasBeam) return "|";
  //   return ".";
  // });

  return board.filter((it) => it.value.hadBeam && it.value.isSplit).length;
}

export function solvePart2(input: string): number {
  const board = parse(input);

  const paths = board
    .filter((it) => it.row === board.height - 1)
    .map((it) => it.value.pathCnt);

  return paths.reduce((sum, it) => sum + it);
}
