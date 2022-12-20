function parse(input: string): number[] {
  return input.split("\n").map((it) => parseInt(it));
}

type ToMix = Array<{ n: number; i: number }>;

function mix(toMix: ToMix, left: number): ToMix {
  if (left === 0) return toMix;

  const totalCount = toMix.length;
  const currentIndex = totalCount - left;
  const mixedIndex = toMix.findIndex((it) => it.i === currentIndex);

  const removed = toMix.splice(mixedIndex, 1);
  const shift = removed[0].n;
  let newIndex = (mixedIndex + shift) % (totalCount - 1);

  if (newIndex === 0) newIndex = totalCount - 1;

  toMix.splice(newIndex, 0, ...removed);

  // console.log('step', currentIndex + 1, JSON.stringify(toMix.map(({ n} ) => n)), `moved ${shift} to ${newIndex}`);

  return mix(toMix, left - 1);
}

export function solvePart1(input: string): number {
  const nums = parse(input);
  const toMix = nums.map((it, i) => ({ n: it, i }));

  // console.log('step', 0, toMix.map(({ n} ) => n).join(', '));

  const remixed = mix(toMix, nums.length);
  const zeroIndex = remixed.findIndex((it) => it.n === 0);

  return [1000, 2000, 3000]
    .map((shift) => {
      console.log(shift, remixed[(zeroIndex + shift) % remixed.length]);
      return remixed[(zeroIndex + shift) % remixed.length];
    })
    .reduce((sum, it) => sum + it.n, 0);
}

export function solvePart2(input: string): number {
  const decryptionKey = 811589153;
  const nums = parse(input);
  const toMix = nums.map((it, i) => ({ n: it * decryptionKey, i }));

  // console.log('step', 0, toMix.map(({ n} ) => n).join(', '));

  let remixed = toMix;

  for (let i = 0; i < 10; i++) {
    remixed = mix(toMix, nums.length);
  }

  const zeroIndex = remixed.findIndex((it) => it.n === 0);

  return [1000, 2000, 3000]
    .map((shift) => {
      console.log(shift, remixed[(zeroIndex + shift) % remixed.length]);
      return remixed[(zeroIndex + shift) % remixed.length];
    })
    .reduce((sum, it) => sum + it.n, 0);
}
