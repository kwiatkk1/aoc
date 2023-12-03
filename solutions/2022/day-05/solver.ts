function parseRow(line: string, count: number) {
    const row = []
    for (let i = 0; i < count; i++) {
        let char = line.charAt(i*4+1);
        if (char !== ' ' && char) {
            row[i] = char;
        }
    }
    return row;
}

function getStack(stacksInput: string): string[][] {
    const lines = stacksInput.split('\n');
    const linesRev = lines.reverse();

    const rowsCount = lines.length - 1;
    const stacksCount = (lines[rowsCount].length + 1) / 4;
    const linesParsed = Array(stacksCount).fill(0).map(() => [] as string[]);

    // console.log({ lines, rowsCount, stacksCount, linesParsed });

    for (let i = 0; i < rowsCount; i++) {
        let row = parseRow(linesRev[i+1], stacksCount);

        for (let j = 0; j < stacksCount; j++) {
            linesParsed[i].push(row[j]);
        }
    }

    const stacks = Array(stacksCount).fill(0).map(() => [] as string[]);

    for (let i = 0; i < stacksCount; i++) {
        for (let j = 0; j < rowsCount; j++) {
            if (linesParsed[j][i]) stacks[i].push(linesParsed[j][i]);
        }
    }

    return stacks;
}

function getCommands(input: string) {
    const lines = input.split('\n');
    return lines.map(line => [...line.matchAll(/\d+/g)].map(it => parseInt(it[0])));
}

function parse(input: string): { stacks: string[][]; commands: number[][] } {
    const [stacksInput, moves] = input.split('\n\n');
    const stacks = getStack(stacksInput);
    const commands = getCommands(moves);

    return { stacks, commands };
}

export function solvePart1(input: string): string {
    const { stacks, commands } = parse(input);

    commands.forEach(([ howMany, from, to ]) => {
        const moved = stacks[from - 1].splice(-howMany, howMany);
        stacks[to - 1].push(...moved.reverse());
    });

    return stacks.map(stack => stack[stack.length-1]).join('');
}

export function solvePart2(input: string): string {
    const { stacks, commands } = parse(input);

    commands.forEach(([ howMany, from, to ]) => {
        const moved = stacks[from - 1].splice(-howMany, howMany);
        stacks[to - 1].push(...moved);
    });

    return stacks.map(stack => stack[stack.length-1]).join('');
}
