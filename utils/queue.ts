type PriorityQueueElement<T> = { item: T; value: number };

export class PriorityQueue<T> {
  private queue: PriorityQueueElement<T>[] = [];
  private getValue: (it: T) => number;

  constructor(elements: T[] = [], getValue: (it: T) => number) {
    this.getValue = getValue;
    this.queue = elements.map((item) => ({ item, value: getValue(item) }));
  }

  upsert(item: T) {
    const { queue } = this;
    const newItem = { item, value: this.getValue(item) };
    const currentIndex = queue.findIndex((it) => it.item === item);

    if (currentIndex !== -1) queue.splice(currentIndex, 1);

    const insertAt = queue.findIndex((it) => it.value > newItem.value);

    if (insertAt === -1) {
      queue.push(newItem);
    } else {
      queue.splice(insertAt, 0, newItem);
    }
  }

  dequeue(): T {
    const min = this.queue.shift();
    if (!min) throw new Error("Queue is empty");
    return min.item;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}
