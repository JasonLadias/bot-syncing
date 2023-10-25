
import { PongQueueElement } from "./types";

class QueueManager {
  queue: PongQueueElement[] = [];

  enqueue(event: PongQueueElement): void {
    const exists = this.queue.some(e => e.blockNumber === event.blockNumber);
    if (!exists) {
      this.queue.push(event);
    }
  }

  dequeue(): PongQueueElement | undefined {
    return this.queue.shift();
  }

  peekFirst(): PongQueueElement | undefined {
    if (this.queue.length === 0) return undefined;
    return this.queue[0];
  }

  printQueue(): void {
    console.log(this.queue);
  }
}

export const queueManager = new QueueManager();
