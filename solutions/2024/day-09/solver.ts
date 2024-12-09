type File = {
  type: "file";
  id: number;
  size: number;
};

type Empty = {
  type: "empty";
  size: number;
};

type Block = File | Empty;

function parse(input: string): Block[] {
  return input.split("").map((it, i): Block => {
    const size = parseInt(it, 10);
    const type = i % 2 ? "empty" : "file";

    return type === "file" ? { type, id: i / 2, size } : { type, size };
  });
}

function toMemory(files: Block[]): number[] {
  const memory: number[] = [];

  files.forEach((file) => {
    for (let i = 0; i < file.size; i++) {
      memory.push(file.type === "file" ? file.id : -1);
    }
  });

  return memory;
}

function printMemory(memory: number[]) {
  console.log(memory.map((it) => (it === -1 ? "." : it)).join(""));
}

function checksum(memory: number[]): number {
  return memory.reduce((acc, curr, i) => {
    return curr > -1 ? acc + i * curr : acc;
  }, 0);
}

export function solvePart1(input: string): number {
  const blocks = parse(input);
  const memory = toMemory(blocks);

  let firstEmpty = memory.indexOf(-1);
  let lastNonEmpty = memory.length - 1;

  while (memory[lastNonEmpty] === -1 && lastNonEmpty > -1) lastNonEmpty--;

  while (firstEmpty < lastNonEmpty) {
    memory[firstEmpty] = memory[lastNonEmpty];
    memory[lastNonEmpty] = -1;
    while (memory[firstEmpty] !== -1 && firstEmpty < lastNonEmpty) firstEmpty++;
    while (memory[lastNonEmpty] === -1 && lastNonEmpty > -1) lastNonEmpty--;
  }

  return checksum(memory);
}

export function solvePart2(input: string): number {
  const blocks = parse(input);

  let lastNonEmpty = blocks.map((it) => it.type).lastIndexOf("file");

  while (lastNonEmpty > 0) {
    const toMove = blocks[lastNonEmpty];

    const dstSpotIndex = blocks.findIndex(
      (it, i) =>
        it.type === "empty" && it.size >= toMove.size && i < lastNonEmpty
    );
    const dst = blocks[dstSpotIndex];

    if (dst) {
      blocks[dstSpotIndex] = toMove;
      blocks[lastNonEmpty] = { type: "empty", size: toMove.size };
      const left = dst.size - toMove.size;
      if (left > 0) {
        blocks.splice(dstSpotIndex + 1, 0, {
          type: "empty",
          size: left,
        });
      }
    } else {
      lastNonEmpty--;
    }

    while (blocks[lastNonEmpty].type === "empty" && lastNonEmpty > -1)
      lastNonEmpty--;
  }

  const memory = toMemory(blocks);

  return checksum(memory);
}
