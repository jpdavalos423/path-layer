import { describe, expect, it } from "vitest";
import { BASE_EDGE_COST, computeEdgeCost } from "@/lib/scoring";
import type { PersonNode } from "@/lib/types";

function makeNode(partial: Partial<PersonNode>): PersonNode {
  return {
    id: partial.id ?? "x",
    name: partial.name ?? "Node",
    company: partial.company ?? "Company",
    role: partial.role ?? "Role",
    school: partial.school ?? "UCSD",
    orgs: partial.orgs ?? [],
    gradYear: partial.gradYear,
    degree: partial.degree ?? 2
  };
}

describe("computeEdgeCost", () => {
  it("applies all modifiers and shared-org cap", () => {
    const from = makeNode({
      id: "you",
      school: "UCSD",
      orgs: ["ACM", "IEEE", "SWE"],
      gradYear: 2027
    });
    const to = makeNode({
      id: "n1",
      school: "UCSD",
      orgs: ["ACM", "IEEE", "NSBE"],
      gradYear: 2027
    });

    const result = computeEdgeCost(from, to, { youId: "you" });

    expect(result.cost).toBe(1);
    expect(result.modifiers.map((modifier) => modifier.type)).toEqual([
      "same_school",
      "shared_org",
      "first_degree_you",
      "same_grad_year"
    ]);
    expect(result.modifiers.find((modifier) => modifier.type === "shared_org")?.value).toBe(-6);
  });

  it("returns base cost when no modifiers apply", () => {
    const from = makeNode({ id: "a", school: "UCLA", orgs: ["ACM"], gradYear: 2026 });
    const to = makeNode({ id: "b", school: "MIT", orgs: ["SWE"], gradYear: 2028 });

    const result = computeEdgeCost(from, to, { youId: "you" });
    expect(result.cost).toBe(BASE_EDGE_COST);
    expect(result.modifiers).toHaveLength(0);
  });
});
