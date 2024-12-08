import { Board, BoardNode } from "../../../utils/board";
import { map, uniq } from "lodash";

type Area = {
  hasAntenna: boolean;
  freqSymbol: string;
  antiSymbol: string[];
};

function parse(input: string) {
  return Board.from(
    input,
    ({ char }): Area => ({
      hasAntenna: char !== ".",
      freqSymbol: char,
      antiSymbol: [],
    })
  );
}

function solve(
  input: string,
  forPair: (a: BoardNode<Area>, b: BoardNode<Area>, map: Board<Area>) => void
) {
  const board = parse(input);

  const allAntennas = board.filter(({ value }) => value.hasAntenna);
  const frequencies = uniq(allAntennas.map(({ value }) => value.freqSymbol));

  frequencies
    .map((symbol) => allAntennas.filter((it) => it.value.freqSymbol === symbol))
    .forEach((sameFreqAntennas) => {
      sameFreqAntennas.forEach((antenna) => {
        sameFreqAntennas
          .filter((other) => other !== antenna)
          .forEach((other) => forPair(antenna, other, board));
      });
    });

  return board.count(({ value }) => !!value.antiSymbol.length);
}

export function solvePart1(input: string): number {
  return solve(input, (antennaA, antennaB, map) => {
    const diff = [antennaB.row - antennaA.row, antennaB.col - antennaA.col];
    const anti = map.get(antennaB.row + diff[0], antennaB.col + diff[1]);

    if (anti) anti.value.antiSymbol.push(antennaA.value.freqSymbol);
  });
}

export function solvePart2(input: string): number {
  return solve(input, (antennaA, antennaB, map) => {
    const diff = [antennaB.row - antennaA.row, antennaB.col - antennaA.col];
    let anti = map.get(antennaA.row + diff[0], antennaA.col + diff[1]);

    while (anti) {
      anti.value.antiSymbol.push(antennaA.value.freqSymbol);
      anti = map.get(anti.row + diff[0], anti.col + diff[1]);
    }
  });
}
