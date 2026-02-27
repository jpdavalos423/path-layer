import type { BfsResult, UnweightedAdjacency } from "@/lib/types";

export function runBfs(adjacency: UnweightedAdjacency, sourceId: string): BfsResult {
  const distanceById: Record<string, number> = {};
  const predecessorById: Record<string, string | null> = {};

  for (const nodeId of Object.keys(adjacency)) {
    distanceById[nodeId] = Number.POSITIVE_INFINITY;
    predecessorById[nodeId] = null;
  }

  if (!(sourceId in adjacency)) {
    return { distanceById, predecessorById };
  }

  const queue: string[] = [sourceId];
  distanceById[sourceId] = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const nextDistance = distanceById[current] + 1;
    for (const neighborId of adjacency[current]) {
      if (distanceById[neighborId] !== Number.POSITIVE_INFINITY) {
        continue;
      }

      distanceById[neighborId] = nextDistance;
      predecessorById[neighborId] = current;
      queue.push(neighborId);
    }
  }

  return { distanceById, predecessorById };
}
