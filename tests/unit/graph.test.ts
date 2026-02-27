import { describe, expect, it } from "vitest";
import { buildPathResult, reconstructPath } from "@/lib/graph";
import type { PersonNode, WeightedAdjacency } from "@/lib/types";

describe("graph utilities", () => {
  it("reconstructs path from predecessor map", () => {
    const path = reconstructPath(
      {
        you: null,
        a: "you",
        b: "a"
      },
      "you",
      "b"
    );

    expect(path).toEqual(["you", "a", "b"]);
  });

  it("builds explainable path breakdown", () => {
    const nodeById: Record<string, PersonNode> = {
      you: {
        id: "you",
        name: "You",
        company: "Personal",
        role: "Candidate",
        school: "UCSD",
        orgs: ["ACM"],
        gradYear: 2027,
        degree: 0
      },
      a: {
        id: "a",
        name: "Alex",
        company: "Amazon",
        role: "Engineer",
        school: "UCSD",
        orgs: ["ACM"],
        gradYear: 2027,
        degree: 1
      }
    };

    const weightedAdjacency: WeightedAdjacency = {
      you: [{ to: "a", cost: 3, modifiers: [{ type: "same_school", value: -3, reason: "same" }] }],
      a: [{ to: "you", cost: 3, modifiers: [{ type: "same_school", value: -3, reason: "same" }] }]
    };

    const result = buildPathResult(["you", "a"], nodeById, weightedAdjacency);
    expect(result.reachable).toBe(true);
    expect(result.totalCost).toBe(3);
    expect(result.hopCount).toBe(1);
    expect(result.edgeBreakdowns).toHaveLength(1);
  });
});
