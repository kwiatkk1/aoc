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

  links.forEach((link) => link.nodes.forEach((node) => node.links.add(link)));

  return { links, nodes };
}

function pathLengthWithout(link: Link) {
  const [start, end] = link.nodes;
  const visited = new Set<Node>();
  const queue = [{ node: start, distance: 0 }];

  while (queue.length) {
    const { node, distance } = queue.shift()!;
    if (node === end) return distance;

    visited.add(node);
    [...node.links]
      .filter((it) => it !== link)
      .forEach((link) => {
        const otherNode = link.nodes.find((n) => n !== node)!;
        if (!visited.has(otherNode)) {
          queue.push({ node: otherNode, distance: distance + 1 });
        }
      });
  }

  throw new Error("No path found");
}

function countReachableNodes(start: Node) {
  const visited = new Set<Node>();
  const queue = [start];

  while (queue.length) {
    const node = queue.shift()!;
    visited.add(node);

    [...node.links]
      .flatMap((link) => link.nodes)
      .filter((it) => it !== node)
      .forEach((otherNode) => {
        if (!visited.has(otherNode)) {
          queue.push(otherNode);
        }
      });
  }

  return visited.size;
}

export function solvePart1(input: string): number {
  const { links, nodes } = parse(input);

  const linksToRemove = links
    .map((link) => ({
      link,
      path: pathLengthWithout(link),
    }))
    .sort((a, b) => b.path - a.path)
    .slice(0, 3)
    .map((it) => it.link);

  linksToRemove.forEach((link) =>
    link.nodes.forEach((node) => node.links.delete(link))
  );

  const firstGroupSize = countReachableNodes(linksToRemove[0].nodes[0]);

  return firstGroupSize * (nodes.length - firstGroupSize);
}
export function solvePart2() {
  return 2023;
}
