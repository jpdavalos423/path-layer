import { runBfs } from "@/lib/algorithms/bfs";
import { runDijkstra } from "@/lib/algorithms/dijkstra";
import {
  addYouEdges,
  buildAdjacency,
  buildWeightedAdjacency,
  createYouNode,
  indexNodesById
} from "@/lib/graph";
import { rankCandidates } from "@/lib/ranking";
import type { CandidateRanking, NetworkDataset, NetworkEdge, PerfMetrics, PersonNode, UserProfile, WeightedAdjacency } from "@/lib/types";

export interface EngineState {
  graphNodes: PersonNode[];
  graphEdges: NetworkEdge[];
  weightedAdjacency: WeightedAdjacency;
  nodeById: Record<string, PersonNode>;
  rankings: CandidateRanking[];
  metrics: PerfMetrics;
}

export function computeEngineState(
  dataset: NetworkDataset,
  profile: UserProfile,
  targetCompany: string,
  topN: number
): EngineState {
  const youNode = createYouNode(profile);
  const graphNodes = [youNode, ...dataset.nodes];
  const graphEdges = addYouEdges(graphNodes, dataset.edges);
  const nodeById = indexNodesById(graphNodes);

  const unweightedAdjacency = buildAdjacency(graphNodes, graphEdges);

  const bfsStart = performance.now();
  const bfsResult = runBfs(unweightedAdjacency, youNode.id);
  const bfsRuntimeMs = performance.now() - bfsStart;

  const weightedAdjacency = buildWeightedAdjacency(graphNodes, graphEdges, youNode.id);
  const dijkstraStart = performance.now();
  const dijkstraResult = runDijkstra(weightedAdjacency, youNode.id);
  const dijkstraRuntimeMs = performance.now() - dijkstraStart;

  const rankings = rankCandidates({
    nodes: graphNodes,
    targetCompany,
    topN,
    sourceId: youNode.id,
    bfsResult,
    dijkstraResult
  });

  return {
    graphNodes,
    graphEdges,
    weightedAdjacency,
    nodeById,
    rankings,
    metrics: {
      nodeCount: graphNodes.length,
      edgeCount: graphEdges.length,
      bfsRuntimeMs,
      dijkstraRuntimeMs
    }
  };
}
