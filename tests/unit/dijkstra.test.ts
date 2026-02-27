import { describe, expect, it } from "vitest";
import { runDijkstra } from "@/lib/algorithms/dijkstra";

describe("runDijkstra", () => {
  it("computes minimum weighted distance path", () => {
    const adjacency = {
      you: [
        { to: "a", cost: 3, modifiers: [] },
        { to: "b", cost: 10, modifiers: [] }
      ],
      a: [
        { to: "you", cost: 3, modifiers: [] },
        { to: "b", cost: 2, modifiers: [] }
      ],
      b: [
        { to: "you", cost: 10, modifiers: [] },
        { to: "a", cost: 2, modifiers: [] }
      ]
    };

    const result = runDijkstra(adjacency, "you");

    expect(result.distanceById.b).toBe(5);
    expect(result.predecessorById.b).toBe("a");
  });
});
