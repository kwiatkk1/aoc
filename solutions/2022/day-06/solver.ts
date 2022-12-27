import { uniq } from "lodash";

// class SlidingWindow {
//     data: string[];
//     size: number;
//     isUnique: boolean = true;
//
//     constructor(data: string[]) {
//         this.data = data;
//         this.size = data.length;
//         this.isUnique = data.length === uniq(data).length;
//     }
//
//     move(next: string[]) {
//         this.data = this.data.slice(next.length).concat(next);
//         this.isUnique = this.data.length === uniq(this.data).length;
//     }
// }
//
// class DeviceState {
//     i: number = -1;
//     windows: string[] = [];
//     windowUnique: boolean = true;
// }
//
// class Device {
//     state: DeviceState = new DeviceState();
//
//     process()
// }

function unique(input: string[]) {
    return input.length === uniq(input).length;
}

export function solvePart1(input: string): number {
    const model = input.split('');
    const size = 4;
    let i = 0;

    for (i = 0; i < model.length; i++) {
        if (unique(model.slice(i, i + size))) return i + size;
    }

    return -1;
}

export function solvePart2(input: string): number {
    const model = input.split('');
    const size = 14;
    let i = 0;

    for (i = 0; i < model.length; i++) {
        if (unique(model.slice(i, i + size))) return i + size;
    }

    return -1;
}