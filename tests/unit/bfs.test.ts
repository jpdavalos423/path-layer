import { describe, expect, it } from "vitest";
import { runBfs } from "@/lib/algorithms/bfs";

describe("runBfs", () => {
  it("computes shortest hop distance and predecessor", () => {
    const adjacency = {
      you: ["a", "c"],
      a: ["you", "b"],
      b: ["a"],
      c: ["you"]
    };

    const result = runBfs(adjacency, "you");

    expect(result.distanceById.b).toBe(2);
    expect(result.predecessorById.b).toBe("a");
    expect(result.distanceById.c).toBe(1);
  });

  it("leaves unreachable nodes at infinity", () => {
    const adjacency = {
      you: ["a"],
      a: ["you"],
      z: []
    };

    const result = runBfs(adjacency, "you");
    expect(result.distanceById.z).toBe(Number.POSITIVE_INFINITY);
    expect(result.predecessorById.z).toBeNull();
  });
});
