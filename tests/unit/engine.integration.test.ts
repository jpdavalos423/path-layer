import { describe, expect, it } from "vitest";
import { computeEngineState } from "@/lib/engine";
import type { NetworkDataset, UserProfile } from "@/lib/types";

const fixtureDataset: NetworkDataset = {
  nodes: [
    {
      id: "n1",
      name: "Amazon Alum",
      company: "Amazon",
      role: "Software Engineer",
      school: "UCSD",
      orgs: ["ACM"],
      gradYear: 2025,
      degree: 1
    },
    {
      id: "n2",
      name: "Bridge Contact",
      company: "Student Network",
      role: "CS Student",
      school: "UCSD",
      orgs: ["SWE"],
      gradYear: 2027,
      degree: 1
    },
    {
      id: "n3",
      name: "Google Contact",
      company: "Google",
      role: "ML Engineer",
      school: "MIT",
      orgs: ["IEEE"],
      gradYear: 2024,
      degree: 2
    }
  ],
  edges: [
    { source: "n1", target: "n2" },
    { source: "n2", target: "n3" }
  ],
  metadata: {
    version: "1.2",
    seed: 1,
    nodeCount: 3,
    edgeCount: 2,
    generatedAt: "2026-02-27T00:00:00.000Z",
    hash: "fixture"
  }
};

describe("computeEngineState integration", () => {
  it("recomputes rankings when profile changes and supports company switch", () => {
    const profileA: UserProfile = {
      name: "You",
      school: "UCSD",
      gradYear: 2027,
      orgs: ["ACM"]
    };

    const profileB: UserProfile = {
      name: "You",
      school: "MIT",
      gradYear: 2027,
      orgs: ["IEEE"]
    };

    const amazonStateA = computeEngineState(fixtureDataset, profileA, "Amazon", 10);
    const amazonStateB = computeEngineState(fixtureDataset, profileB, "Amazon", 10);

    expect(amazonStateA.rankings).toHaveLength(1);
    expect(amazonStateB.rankings).toHaveLength(1);
    expect(amazonStateA.rankings[0].weightedCost).not.toBe(amazonStateB.rankings[0].weightedCost);

    const googleState = computeEngineState(fixtureDataset, profileA, "Google", 10);
    expect(googleState.rankings).toHaveLength(1);
    expect(googleState.rankings[0].candidateName).toBe("Google Contact");
  });
});
