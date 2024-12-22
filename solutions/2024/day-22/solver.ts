import { progressLogger } from "../../../utils/debug";

function parse(input: string) {
  return input.split("\n").map(Number);
}

const mix = (num: number, value: number) => num ^ value;
const prune = (num: number) => num & (16777216 - 1);

function nextSecret(num: number) {
  const secret = num;

  const step1 = secret << 6;
  const step2 = mix(secret, step1);
  const secret2 = prune(step2);

  const step3 = secret2 >> 5;
  const step4 = mix(secret2, step3);
  const secret3 = prune(step4);

  const step6 = secret3 << 11;
  const step7 = mix(secret3, step6);
  return prune(step7);
}

export async function solvePart1(input: string) {
  const data = parse(input);
  const results: number[] = [];

  for (let secret of data) {
    let num = secret;
    for (let i = 0; i < 2000; i++) {
      num = nextSecret(num);
    }
    results.push(num);
  }

  return results.reduce((acc, curr) => acc + curr, 0);
}
export function solvePart2(input: string): number {
  const startSecrets = parse(input);

  const secretSequences = startSecrets.map((secret) => {
    let results: number[] = [secret];
    for (let i = 0; i < 2000; i++) {
      secret = nextSecret(secret);
      results.push(secret);
    }
    return results;
  });

  const priceSequences = secretSequences.map((seq) =>
    seq.map((num) => num % 10)
  );

  const diffSequences = priceSequences.map((seq) =>
    seq.map((price, i) => ({ price, diff: i ? price - seq[i - 1] : 0 }))
  );

  const seqSequences = diffSequences.map((seq) =>
    seq.map(({ price }, i) => ({
      price,
      sequence:
        i > 4
          ? seq
              .slice(i - 3, i + 1)
              .map((it) => it.diff)
              .join(",")
          : null,
    }))
  );

  const sellersMaps: Record<string, number>[] = [];

  for (let seller of seqSequences) {
    progressLogger.print(
      `Checking seller ${seqSequences.indexOf(seller)}/${seqSequences.length}`
    );
    const seqPerSeller: Record<string, number> = {};

    seller.forEach(({ price, sequence }) => {
      if (sequence && !(sequence in seqPerSeller)) {
        seqPerSeller[sequence] = price;
      }
    });

    sellersMaps.push(seqPerSeller);
  }

  const allPossibleSequences = [
    ...new Set(sellersMaps.flatMap((seller) => Object.keys(seller))),
  ];

  const results = allPossibleSequences.map((seq) => {
    progressLogger.print(
      `Checking sequence ${allPossibleSequences.indexOf(seq)}/${
        allPossibleSequences.length
      }`
    );

    return Object.values(sellersMaps)
      .map((seller) => seller[seq] || 0)
      .reduce((acc, curr) => acc + curr, 0);
  });

  return results.sort((a, b) => b - a)[0];
}
