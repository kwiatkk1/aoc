type Properties = {
  capacity: number;
  durability: number;
  flavor: number;
  texture: number;
  calories: number;
};

type Ingredient = { name: string } & Properties;

type CookiePiece = Array<{ ingredient: Ingredient; teaspoons: number }>;
type Cookie = Properties;

function parse(input: string): Ingredient[] {
  return input.split("\n").map((line) => {
    const [name, properties] = line.split(": ");
    const [capacity, durability, flavor, texture, calories] = properties
      .match(/(-?\d+)/g)!
      .map((it) => Number(it));
    return { name, capacity, durability, flavor, texture, calories };
  });
}

const toMax = (a: number, b: number) => Math.max(a, b);
const toProduct = (a: number, b: number) => a * b;

function toCookie(cookie: CookiePiece): Cookie {
  return cookie.reduce<Properties>(
    (totals, { ingredient, teaspoons }) => {
      totals.capacity += ingredient.capacity * teaspoons;
      totals.durability += ingredient.durability * teaspoons;
      totals.flavor += ingredient.flavor * teaspoons;
      totals.texture += ingredient.texture * teaspoons;
      totals.calories += ingredient.calories * teaspoons;
      return totals;
    },
    {
      capacity: 0,
      durability: 0,
      flavor: 0,
      texture: 0,
      calories: 0,
    }
  );
}

function toScore(cookie: Cookie): number {
  const values = [
    cookie.capacity,
    cookie.durability,
    cookie.flavor,
    cookie.texture,
  ];

  return values.map((it) => Math.max(0, it)).reduce(toProduct);
}

function getAllCookieRecipes(
  ingredients: Ingredient[],
  limit: number
): CookiePiece[] {
  const [ingredient, ...restIngredients] = ingredients;

  if (!restIngredients.length) return [[{ ingredient, teaspoons: limit }]];

  const cookies: CookiePiece[] = [];

  for (let i = 1; i < limit; i++) {
    getAllCookieRecipes(restIngredients, limit - i).forEach((option) => {
      cookies.push([{ ingredient, teaspoons: i }, ...option]);
    });
  }

  return cookies.filter(
    (it) => it.reduce((teaspoons, it) => teaspoons + it.teaspoons, 0) === limit
  );
}

export function solvePart1(input: string): number {
  const ingredients = parse(input);
  const totalTeaspoons = 100;
  return getAllCookieRecipes(ingredients, totalTeaspoons)
    .map(toCookie)
    .map(toScore)
    .reduce(toMax);
}

export function solvePart2(input: string): number {
  const ingredients = parse(input);
  const totalTeaspoons = 100;
  const totalCalories = 500;

  return getAllCookieRecipes(ingredients, totalTeaspoons)
    .map(toCookie)
    .filter(({ calories }) => calories === totalCalories)
    .map(toScore)
    .reduce(toMax);
}
