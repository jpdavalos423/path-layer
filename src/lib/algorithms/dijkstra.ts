import type { DijkstraResult, WeightedAdjacency } from "@/lib/types";

interface QueueNode {
  id: string;
  distance: number;
}

class MinPriorityQueue {
  private heap: QueueNode[] = [];

  push(node: QueueNode): void {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): QueueNode | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    const min = this.heap[0];
    const tail = this.heap.pop();
    if (tail && this.heap.length > 0) {
      this.heap[0] = tail;
      this.bubbleDown(0);
    }

    return min;
  }

  get size(): number {
    return this.heap.length;
  }

  private bubbleUp(startIdx: number): void {
    let idx = startIdx;

    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[parent].distance <= this.heap[idx].distance) {
        return;
      }

      [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
      idx = parent;
    }
  }

  private bubbleDown(startIdx: number): void {
    let idx = startIdx;

    while (true) {
      const left = idx * 2 + 1;
      const right = idx * 2 + 2;
      let smallest = idx;

      if (left < this.heap.length && this.heap[left].distance < this.heap[smallest].distance) {
        smallest = left;
      }

      if (right < this.heap.length && this.heap[right].distance < this.heap[smallest].distance) {
        smallest = right;
      }

      if (smallest === idx) {
        return;
      }

      [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
      idx = smallest;
    }
  }
}

export function runDijkstra(adjacency: WeightedAdjacency, sourceId: string): DijkstraResult {
  const distanceById: Record<string, number> = {};
  const predecessorById: Record<string, string | null> = {};

  for (const nodeId of Object.keys(adjacency)) {
    distanceById[nodeId] = Number.POSITIVE_INFINITY;
    predecessorById[nodeId] = null;
  }

  if (!(sourceId in adjacency)) {
    return { distanceById, predecessorById };
  }

  const queue = new MinPriorityQueue();
  distanceById[sourceId] = 0;
  queue.push({ id: sourceId, distance: 0 });

  while (queue.size > 0) {
    const node = queue.pop();
    if (!node) {
      break;
    }

    if (node.distance > distanceById[node.id]) {
      continue;
    }

    for (const neighbor of adjacency[node.id]) {
      const candidateDistance = node.distance + neighbor.cost;
      if (candidateDistance < distanceById[neighbor.to]) {
        distanceById[neighbor.to] = candidateDistance;
        predecessorById[neighbor.to] = node.id;
        queue.push({ id: neighbor.to, distance: candidateDistance });
      }
    }
  }

  return { distanceById, predecessorById };
}
