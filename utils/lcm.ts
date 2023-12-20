export const gcd = (a: number, b: number) => {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
};

export const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

export const lcmOf = (arr: number[]) => arr.reduce(lcm, 1);
