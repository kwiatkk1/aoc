type Game = { game: number; sets: { count: number; name: string }[][] };

function parse(input: string): Game[] {
  return input.split("\n").map((gameline) => {
    const [gameT, setT] = gameline.split(": ");

    return {
      game: parseInt(gameT.substring("Game ".length)),
      sets: setT.split("; ").map((setT) => {
        return setT.split(", ").map((gemT) => {
          const [countT, name] = gemT.split(" ");
          return { count: parseInt(countT), name };
        });
      }),
    };
  });
}

export function solvePart1(input: string): number {
  const games = parse(input);
  const max: Record<string, number> = {
    red: 12,
    green: 13,
    blue: 14,
  };

  function isValid(game: Game) {
    return !game.sets.some((set) =>
      set.some((gem) => max[gem.name] < gem.count)
    );
  }

  return games.filter(isValid).reduce((sum, game) => sum + game.game, 0);
}

export function solvePart2(input: string): number {
  const games = parse(input);

  return games
    .map(function (game) {
      const max: Record<string, number> = {
        red: 0,
        green: 0,
        blue: 0,
      };

      game.sets.forEach((set) => {
        set.forEach((gem) => {
          if (max[gem.name] < gem.count) max[gem.name] = gem.count;
        });
      });

      return max.red * max.green * max.blue;
    })
    .reduce((sum, power) => sum + power, 0);
}
