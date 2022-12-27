class SnafuNumber {
  base: number = 5;
  offset: number = -2;
  constructor(public values: number[]) {}

  get decimalValue() {
    return [...this.values].reverse().reduce((sum, value, digit) => {
      return sum + value * Math.pow(this.base, digit);
    });
  }

  add(numb: SnafuNumber) {
    const a = [...this.values].reverse();
    const b = [...numb.values].reverse();
    const result: number[] = [];

    // naive add...
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      result.push((a[i] || 0) + (b[i] || 0));
    }

    // ...then balance
    result.forEach((digit, i) => {
      // forward
      if (digit >= this.base + this.offset) {
        result[i] = -1 * (this.base - digit);
        if (typeof result[i + 1] === "undefined") result[i + 1] = 0;
        result[i + 1] += 1;
      }

      // borrow
      if (digit < this.offset) {
        result[i] = this.base + digit;
        if (typeof result[i + 1] === "undefined") result[i + 1] = 0;
        result[i + 1] -= 1;
      }
    });

    return new SnafuNumber(result.reverse());
  }

  toSnafuString() {
    return this.values
      .map((num) => {
        if (num === -2) return "=";
        if (num === -1) return "-";
        return num.toString();
      })
      .join("");
  }

  static fromText(line: string) {
    const values = line.split("").map((char) => {
      if (char === "=") return -2;
      if (char === "-") return -1;
      return parseInt(char);
    });

    return new SnafuNumber(values);
  }
}

function parse(input: string) {
  return input.split("\n").map(SnafuNumber.fromText);
}

export function solvePart1(input: string): string {
  const numbers = parse(input);

  const result = numbers.reduce(
    (sum, num) => sum.add(num),
    new SnafuNumber([0])
  );

  return result.toSnafuString();
}
