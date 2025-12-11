type Node = {
  name: string;
  links: Set<Link>;
};

type Link = {
  nodes: [Node, Node];
};

function parse(input: string) {
  const preNodes = input.split("\n").map((line) => {
    const [name, ...linksText] = line.split(/[: ]+/);
    return { name, linksText };
  });

  preNodes.forEach((node) => {
    node.linksText.filter((name) => {
      let link = preNodes.find((n) => n.name === name);
      if (!link) preNodes.push({ name, linksText: [] });
    });
  });

  const nodes = preNodes.map<Node>((node) => ({
    name: node.name,
    links: new Set(),
  }));

  const links = preNodes
    .flatMap((node) => {
      return node.linksText.map<[Node, Node]>((linkName) => [
        nodes.find((n) => n.name === node.name)!,
        nodes.find((n) => n.name === linkName)!,
      ]);
    })
    .map<Link>((nodes) => ({ nodes }));

  links.forEach((link) => link.nodes[0].links.add(link));

  return { links, nodes };
}

function solutions(src: Node, dst: Node) {
  const paths: Node[][] = [];
  const queue = [[src]];

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];

    if (node === dst) {
      paths.push(path);
    }

    [...node.links]
      .flatMap((it) => (it ? [it.nodes[1]] : []))
      .filter((it) => !path.includes(it))
      .forEach((it) => queue.push([...path, it]));
  }

  return paths;
}

export function solvePart1(input: string): number {
  const { nodes } = parse(input);
  const src = nodes.find((n) => n.name === "you");
  const dst = nodes.find((n) => n.name === "out");
  return src && dst ? solutions(src, dst).length : -1;
}

export function solvePart2(input: string) {
  const { nodes } = parse(input);
  const src = nodes.find((n) => n.name === "svr");
  const dst = nodes.find((n) => n.name === "out")!;

  if (!src) return -1;

  const memo: Map<string, number> = new Map();

  const pathsCount = (from: Node, hasDac: boolean, hasFft: boolean): number => {
    const key = [from.name, hasDac, hasFft].join("|");
    if (memo.has(key)) return memo.get(key)!;

    if (from === dst) return hasDac && hasFft ? 1 : 0;
    if (from.name === "fft") hasFft = true;
    if (from.name === "dac") hasDac = true;

    let count = 0;

    for (let next of [...from.links].map((link) => link.nodes[1])) {
      count += pathsCount(next, hasDac, hasFft);
    }

    memo.set([from.name, hasDac, hasFft].join("|"), count);
    return count;
  };

  return pathsCount(src, false, false);
}
