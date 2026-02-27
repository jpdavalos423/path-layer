import { describe, expect, it } from "vitest";
import { rankCandidates } from "@/lib/ranking";
import type { PersonNode } from "@/lib/types";

const nodes: PersonNode[] = [
  {
    id: "you",
    name: "You",
    company: "Personal Profile",
    role: "Candidate",
    school: "UCSD",
    orgs: ["ACM"],
    gradYear: 2027,
    degree: 0
  },
  {
    id: "a",
    name: "Alex",
    company: "Amazon",
    role: "Engineer",
    school: "UCSD",
    orgs: ["ACM"],
    gradYear: 2027,
    degree: 1
  },
  {
    id: "b",
    name: "Blair",
    company: "Amazon",
    role: "Engineer",
    school: "MIT",
    orgs: ["SWE"],
    gradYear: 2025,
    degree: 1
  }
];

describe("rankCandidates", () => {
  it("sorts by weighted friction, then hops, then candidate name", () => {
    const rankings = rankCandidates({
      nodes,
      targetCompany: "Amazon",
      topN: 10,
      sourceId: "you",
      bfsResult: {
        distanceById: { you: 0, a: 1, b: 1 },
        predecessorById: { you: null, a: "you", b: "you" }
      },
      dijkstraResult: {
        distanceById: { you: 0, a: 3, b: 7 },
        predecessorById: { you: null, a: "you", b: "you" }
      }
    });

    expect(rankings).toHaveLength(2);
    expect(rankings[0].candidateId).toBe("a");
    expect(rankings[1].candidateId).toBe("b");
    expect(rankings[0].pathDiffers).toBe(false);
  });
});
