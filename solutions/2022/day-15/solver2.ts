type Coords = { x: number; y: number };

function length(a: Coords, b: Coords) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

class Sensor {
  radius: number;
  maxLeft: Coords;
  maxRight: Coords;
  maxTop: Coords;
  maxBottom: Coords;

  constructor(public position: Coords, public beacon: Coords) {
    this.radius = length(position, beacon);
    this.maxLeft = { x: position.x - this.radius, y: position.y };
    this.maxRight = { x: position.x + this.radius, y: position.y };
    this.maxTop = { x: position.x, y: position.y - this.radius };
    this.maxBottom = { x: position.x, y: position.y + this.radius };
  }

  isInRange(checkedPosition: Coords) {
    return length(this.position, checkedPosition) <= this.radius;
  }

  nextToCheckInRow(checkedPosition: Coords) {
    return (
      checkedPosition.x + (this.radius - length(this.position, checkedPosition))
    );
  }
}

function parse(input: string) {
  const [data, constraints] = input.split("\n\n");

  return {
    data: data.split("\n").map((line) => {
      const [first, second] = line.split(": closest beacon is at ");
      return {
        sensor: JSON.parse(
          `{${first
            .substring(10)
            .replaceAll("=", ":")
            .replaceAll("x", '"x"')
            .replaceAll("y", '"y"')}}`
        ) as {
          x: number;
          y: number;
        },
        beacon: JSON.parse(
          `{${second
            .replaceAll("=", ":")
            .replaceAll("x", '"x"')
            .replaceAll("y", '"y"')}}`
        ) as {
          x: number;
          y: number;
        },
      };
    }),
    constraints: JSON.parse(constraints),
  };
}

export function solvePart2(input: string): number {
  const { data, constraints } = parse(input);
  const max = constraints.part2.max;
  const model = data.map((it) => new Sensor(it.sensor, it.beacon));
  let found: Coords | null = null;

  outer: for (let y = 0; y <= max; y++) {
    const possibleY = model.filter(
      (it) => it.maxTop.y <= y && it.maxBottom.y >= y
    );
    inner: for (let x = 0; x <= max; x++) {
      //const possibleX = possibleY.filter(it => it.maxLeft.x <= x && it.maxRight.x >= x);

      for (let sensor of possibleY) {
        if (sensor.isInRange({ x, y })) {
          x = sensor.nextToCheckInRow({ x, y });
          continue inner;
        }
      }
      found = { x, y };
    }
  }

  if (found) return found.x * 4000000 + found.y;
  return -1;
}
