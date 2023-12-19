type Category = "x" | "m" | "a" | "s";
type State = Record<Category, number>;

type Min = { min: number; field: Category };
type Max = { max: number; field: Category };
type Cond = Min | Max;

type Range = {
  min: Record<Category, number>;
  max: Record<Category, number>;
};

type RuleFunc = (input: State) => null | string;

type CmdStop = { kind: "stop"; accepted: boolean };
type CmdGoto = { kind: "goto"; name: string; link: Cmd };
type CmdCond = { kind: "cond"; cond: Cond; t: Cmd; f: Cmd };
type Cmd = CmdStop | CmdGoto | CmdCond;

type Workflow = {
  name: string;
  pipeline: RuleFunc[];
  rule: Cmd;
  rules: Cmd[];
};

function parse(input: string) {
  const [workflowsT, stateT] = input.split("\n\n");

  const workflowsList = workflowsT.split("\n").map<Workflow>((line) => {
    const [name, rulesT] = line.split(/[{}]/);
    const pipeline = rulesT.split(",").map((text) => {
      if (text === "A") return () => "A";
      if (text === "R") return () => "R";
      const [conditionT, target] = text.split(":");
      const [field, valueT] = conditionT.split(/[<>]/);
      const more = conditionT.includes(">");
      const value = Number(valueT);
      const key = field as keyof State;

      if (!target) return () => conditionT;

      return more
        ? (input: State) => (input[key] > value ? target : null)
        : (input: State) => (input[key] < value ? target : null);
    });

    const rules = rulesT.split(",").map<Cmd>((text) => {
      const [conditionT, target] = text.split(":");
      const [field, valueT] = conditionT.split(/[<>]/);
      const more = conditionT.includes(">");
      const value = Number(valueT);
      const key = field as keyof State;

      if (text === "A") return { kind: "stop", accepted: true };
      if (text === "R") return { kind: "stop", accepted: false };
      if (!target)
        return {
          kind: "goto",
          name: conditionT,
          link: { kind: "stop", accepted: false },
        };

      const condition: Cond = more
        ? { min: value, field: key }
        : { max: value, field: key };

      const success =
        target === "A"
          ? ({ kind: "stop", accepted: true } as Cmd)
          : target === "R"
          ? ({ kind: "stop", accepted: false } as Cmd)
          : ({ kind: "goto", name: target } as Cmd);

      return { kind: "cond", cond: condition, t: success } as Cmd;
    });

    for (let i = 1; i < rules.length; i++) {
      const prev = rules[i - 1];
      if (prev.kind === "cond") {
        prev.f = rules[i];
      }
    }

    const rule = rules[0] as CmdCond;

    return {
      name,
      pipeline,
      rule,
      rules,
    };
  });

  const states = stateT.split("\n").map<State>((line) => {
    const [, x, , m, , a, , s] = line
      .substring(1, line.length - 1)
      .split(/[,=]/);

    return {
      x: Number(x),
      m: Number(m),
      a: Number(a),
      s: Number(s),
    };
  });

  const workflows = workflowsList.reduce((acc, workflow) => {
    acc[workflow.name] = workflow;
    return acc;
  }, {} as Record<string, Workflow>);

  // link commands
  workflowsList.forEach((workflow) => {
    workflow.rules.forEach((rule: Cmd) => {
      if (rule.kind === "cond" && rule.t.kind === "goto") {
        rule.t.link = workflows[rule.t.name].rule;
      }

      if (rule.kind === "goto") {
        rule.link = workflows[rule.name].rule;
      }
    });
  });

  return { workflows, states };
}

export function solvePart1(input: string): number {
  const { workflows, states } = parse(input);

  const startWorkflowName = "in";
  const endSymbols = ["A", "R"];
  const winningStates: State[] = [];

  states.forEach((state) => {
    let workflow = workflows[startWorkflowName];

    while (true) {
      const rule = workflow.pipeline.find((rule) => rule(state) !== null);
      const result = rule && rule(state);

      if (!result) break;

      if (endSymbols.includes(result)) {
        if (result === "A") winningStates.push(state);
        break;
      }

      workflow = workflows[result];
    }
  });

  return winningStates.reduce((sum, { x, m, a, s }) => {
    return sum + x + m + a + s;
  }, 0);
}

export function solvePart2(input: string): number {
  const { workflows } = parse(input);
  const startWorkflowName = "in";
  const rulesTreeRoot = workflows[startWorkflowName].rule;
  const pathsToAcceptance: Cond[][] = [];

  const walkTree = (cmd: Cmd, path: Cond[] = []) => {
    if (cmd.kind === "stop" && cmd.accepted) {
      pathsToAcceptance.push([...path]);
    }

    if (cmd.kind === "goto") {
      walkTree(cmd.link, path);
    }

    if (cmd.kind === "cond") {
      const { cond, t, f } = cmd;
      const { field } = cond;

      // visit true branch
      walkTree(t, [...path, cond]);

      // visit false branch
      const reversedCondition: Cond =
        "min" in cond
          ? { max: cond.min + 1, field }
          : { min: cond.max - 1, field };

      walkTree(f, [...path, reversedCondition]);
    }
  };

  walkTree(rulesTreeRoot);

  const minRange = 0;
  const maxRange = 4001;

  const ranges = pathsToAcceptance.map((path) =>
    path.reduce<Range>(
      (range, condition) => {
        const { field } = condition;
        const { min, max } = range;

        if ("min" in condition) {
          min[field] = Math.max(min[field], condition.min);
        } else {
          max[field] = Math.min(max[field], condition.max);
        }

        return range;
      },
      {
        min: { x: minRange, m: minRange, a: minRange, s: minRange },
        max: { x: maxRange, m: maxRange, a: maxRange, s: maxRange },
      }
    )
  );

  const options = ranges.map((range) => {
    const { min, max } = range;
    const x = max.x - min.x - 1;
    const m = max.m - min.m - 1;
    const a = max.a - min.a - 1;
    const s = max.s - min.s - 1;

    return x * m * a * s;
  });

  return options.reduce((sum, count) => sum + count, 0);
}
