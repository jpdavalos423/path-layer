import { arraysEqual, reconstructPath } from "@/lib/graph";
import type { BfsResult, CandidateRanking, DijkstraResult, PersonNode } from "@/lib/types";

interface RankCandidatesParams {
  nodes: PersonNode[];
  targetCompany: string;
  topN: number;
  sourceId: string;
  bfsResult: BfsResult;
  dijkstraResult: DijkstraResult;
}

export function rankCandidates({
  nodes,
  targetCompany,
  topN,
  sourceId,
  bfsResult,
  dijkstraResult
}: RankCandidatesParams): CandidateRanking[] {
  const candidates = nodes.filter(
    (node) =>
      node.id !== sourceId &&
      node.company.toLowerCase() === targetCompany.toLowerCase() &&
      bfsResult.distanceById[node.id] !== undefined
  );

  const ranked = candidates
    .map((candidate) => {
      const weightedCost = dijkstraResult.distanceById[candidate.id];
      const hopCount = bfsResult.distanceById[candidate.id];

      const shortestPath = reconstructPath(bfsResult.predecessorById, sourceId, candidate.id);
      const weightedPath = reconstructPath(dijkstraResult.predecessorById, sourceId, candidate.id);

      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        company: candidate.company,
        weightedCost,
        hopCount,
        weightedPath,
        shortestPath,
        pathDiffers: !arraysEqual(shortestPath, weightedPath)
      } as CandidateRanking;
    })
    .filter(
      (candidate) =>
        Number.isFinite(candidate.hopCount) &&
        Number.isFinite(candidate.weightedCost) &&
        candidate.shortestPath.length > 0 &&
        candidate.weightedPath.length > 0
    )
    .sort((a, b) => {
      if (a.weightedCost !== b.weightedCost) {
        return a.weightedCost - b.weightedCost;
      }

      if (a.hopCount !== b.hopCount) {
        return a.hopCount - b.hopCount;
      }

      return a.candidateName.localeCompare(b.candidateName);
    });

  return ranked.slice(0, topN);
}
