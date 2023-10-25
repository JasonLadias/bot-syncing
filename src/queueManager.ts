
import { PongQueueElement } from "./types";

/**
 * This class is used to manage the queue of pongs to be sent.
 */
class QueueManager {
  queue: PongQueueElement[] = [];

  /**
   * Adds a new element to the queue if it does not already exist.
   * 
   * @param event 
   */
  enqueue(event: PongQueueElement): void {
    const exists = this.queue.some(e => e.blockNumber === event.blockNumber);
    if (!exists) {
      this.queue.push(event);
    }
  }

  /**
   * This method removes the first element from the queue and returns it.
   * 
   * @returns 
   */
  dequeue(): PongQueueElement | undefined {
    return this.queue.shift();
  }

  /**
   * This method returns the first element in the queue without removing it.
   * 
   * @returns 
   */
  peekFirst(): PongQueueElement | undefined {
    if (this.queue.length === 0) return undefined;
    return this.queue[0];
  }

  /**
   * This method prints the queue
   * 
   * @returns 
   */
  printQueue(): void {
    console.log(this.queue);
  }
}

export const queueManager = new QueueManager();
