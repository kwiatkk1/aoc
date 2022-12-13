function parse(input: string) {
  return input
    .split("\n\n")
    .map((pair) => pair.split("\n").map((line) => JSON.parse(line)));
}

function isRightOrder(left: any, right: any): boolean | null {
  const isLeftArray = Array.isArray(left);
  const isRightArray = Array.isArray(right);

  if (!isLeftArray && !isRightArray) {
    return left === right ? null : left < right;
  }

  if ((!isLeftArray && isRightArray) || (isLeftArray && !isRightArray)) {
    if (!isLeftArray) return isRightOrder([left], right);
    if (!isRightArray) return isRightOrder(left, [right]);
  }

  for (let i = 0; i < left.length; i++) {
    if (typeof right[i] === "undefined") return false;
    const res = isRightOrder(left[i], right[i]);
    if (res !== null) return res;
  }

  if (left.length === right.length) return null;

  return true;
}

function compare(left: any, right: any): number {
  const isLeftArray = Array.isArray(left);
  const isRightArray = Array.isArray(right);

  if (!isLeftArray && !isRightArray) {
    return left === right ? 0 : left < right ? -1 : 1;
  }

  if ((!isLeftArray && isRightArray) || (isLeftArray && !isRightArray)) {
    if (!isLeftArray) return compare([left], right);
    if (!isRightArray) return compare(left, [right]);
  }

  for (let i = 0; i < left.length; i++) {
    if (typeof right[i] === "undefined") return 1;
    const res = compare(left[i], right[i]);
    if (res !== 0) return res;
  }

  if (left.length === right.length) return 0;

  return -1;
}

export function solvePart1(input: string): number {
  const pairs = parse(input);
  return pairs
    .map((pair, i) => ({ i: i + 1, result: isRightOrder(pair[0], pair[1]) }))
    .map((it) => {
      // console.log(it);
      return it;
    })
    .reduce((sum, acc) => (acc.result ? sum + acc.i : sum), 0);
}

export function solvePart2(input: string): number {
  const pairs = parse(input);

  const elements = [...pairs.flat(), [[2]], [[6]]];

  elements.sort(compare);

  //elements.forEach((line, i) => console.log(i + 1, JSON.stringify(line)));

  const markers: number[] = [];
  elements
    .map((line) => JSON.stringify(line))
    .forEach((line, index) => {
      //console.log(line)
      if (line === "[[2]]" || line === "[[6]]") markers.push(index);
    });

  return (markers[0] + 1) * (markers[1] + 1);
}
