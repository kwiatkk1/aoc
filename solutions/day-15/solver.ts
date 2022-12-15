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
}

function parse(input: string) {
  return input.split("\n").map((line) => {
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
  });
}

export function solvePart1(input: string, row: number): number {
  const model = parse(input).map((it) => new Sensor(it.sensor, it.beacon));

  const minX = Math.min(...model.map((it) => it.maxLeft.x));
  const maxX = Math.max(...model.map((it) => it.maxRight.x));

  console.log({ minX, maxX });

  const occupied: Coords[] = []
  for (let x = minX; x <= maxX; x++) {
    if (model.some((s) => s.isInRange({ x, y: row }))) {
        occupied.push({ x, y: row });
    }
  }
  const occupiedMinusBeacons = occupied.filter(it => !model.some(sensor => {
      return it.x === sensor.position.x && it.y === sensor.position.y || it.x === sensor.beacon.x && it.y === sensor.beacon.y;
  }))

  return occupiedMinusBeacons.length;
}

export function solvePart2(input: string): string {
  const model = parse(input);
  return "";
}
