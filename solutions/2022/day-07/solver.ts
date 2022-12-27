import { parseInt } from "lodash";

class NodeDir {
  content: Node[] = [];
  parent: NodeDir | null = null;
  constructor(public name: string) {}

  getSubdir(name: string): NodeDir | undefined {
    return this.content
      .flatMap((node) => (node instanceof NodeDir ? [node] : []))
      .find((node) => node.name === name);
  }

  getSize(): number {
    return this.content.reduce((sum: number, node: Node) => {
      if (node instanceof NodeDir) return sum + node.getSize();
      else return sum + node.size;
    }, 0);
  }
}
class NodeFile {
  constructor(public name: string, public size: number) {}
}

class CmdDir {
  constructor(public name: string) {}
}

class CmdLs {}

type Cmd = CmdDir | CmdLs;
type Node = NodeDir | NodeFile;
type Output = Cmd | Node;

function parseLine(txt: string): Output | undefined {
  const [a, b, c] = txt.split(" ");
  if (a === "$") {
    if (b === "cd") return new CmdDir(c);
    if (b === "ls") return new CmdLs();
  }
  if (a === "dir") return new NodeDir(b);
  if (!isNaN(parseInt(a))) return new NodeFile(b, parseInt(a));
}

function parse(input: string) {
  const lines = input.split("\n");
  const disk = new NodeDir("disk");
  const root = new NodeDir("/");
  disk.content = [];
  root.parent = disk;

  let currentDir = root;
  const allDirs = [];

  for (let line of lines) {
    const output = parseLine(line);

    if (output instanceof CmdDir) {
      const isUp = output.name === "..";

      if (isUp) {
        currentDir = currentDir.parent!;
      } else {
        const subdir = currentDir.getSubdir(output.name);

        if (subdir) {
          currentDir = subdir;
        }
      }
    } else if (output instanceof NodeDir) {
      if (!currentDir.getSubdir(output.name)) {
        output.parent = currentDir;
        currentDir.content.push(output);
        allDirs.push(output);
      }
    } else if (output instanceof NodeFile) {
      if (
        !currentDir.content.some(
          (node) => node instanceof NodeFile && node.name === output.name
        )
      ) {
        currentDir.content.push(output);
      }
    } else if (output instanceof CmdLs) {
    }
  }
  return { root, allDirs };
}

export function solvePart1(input: string): number {
  const { root, allDirs } = parse(input);
  const smaller = allDirs
    .map((dir) => dir.getSize())
    .filter((size) => size < 100000);

  return smaller.reduce((sum, size) => sum + size, 0);
}

export function solvePart2(input: string): number {
  const { root, allDirs } = parse(input);
  const total = 70000000;
  const limit = 30000000;
  const unused = total - root.getSize();
  const toRemove = limit - unused;

  console.log({ limit, rootSize: root.getSize(), toRemove });

  const allDirsSize = allDirs
    .map((dir) => ({ dir, size: dir.getSize() }))
    .sort((a, b) => a.size - b.size);

  const larger = allDirsSize.filter(
    ({ dir, size }: { dir: NodeDir; size: number }) => size >= toRemove
  );
  console.log(larger.map(({ dir, size }) => `${dir.name}: ${size}`).join("\n"));

  return larger[0].size;
}
