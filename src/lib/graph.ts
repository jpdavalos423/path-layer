import { computeEdgeCost } from "@/lib/scoring";
import type { EdgeCostResult } from "@/lib/scoring";
import type {
  NetworkEdge,
  PathEdgeBreakdown,
  PathResult,
  PersonNode,
  UnweightedAdjacency,
  UserProfile,
  WeightedAdjacency
} from "@/lib/types";

function sortedNeighbors(neighbors: string[]): string[] {
  return [...neighbors].sort((a, b) => a.localeCompare(b));
}

export function indexNodesById(nodes: PersonNode[]): Record<string, PersonNode> {
  return Object.fromEntries(nodes.map((node) => [node.id, node]));
}

export function buildAdjacency(nodes: PersonNode[], edges: NetworkEdge[]): UnweightedAdjacency {
  const adjacency: UnweightedAdjacency = {};

  for (const node of nodes) {
    adjacency[node.id] = [];
  }

  for (const edge of edges) {
    if (adjacency[edge.source] && adjacency[edge.target]) {
      adjacency[edge.source].push(edge.target);
      adjacency[edge.target].push(edge.source);
    }
  }

  for (const nodeId of Object.keys(adjacency)) {
    adjacency[nodeId] = sortedNeighbors([...new Set(adjacency[nodeId])]);
  }

  return adjacency;
}

export function buildWeightedAdjacency(
  nodes: PersonNode[],
  edges: NetworkEdge[],
  youId: string
): WeightedAdjacency {
  const adjacency: WeightedAdjacency = {};
  const nodeById = indexNodesById(nodes);

  for (const node of nodes) {
    adjacency[node.id] = [];
  }

  for (const edge of edges) {
    const from = nodeById[edge.source];
    const to = nodeById[edge.target];

    if (!from || !to) {
      continue;
    }

    const forwardCost = computeEdgeCost(from, to, { youId });
    const reverseCost = computeEdgeCost(to, from, { youId });

    adjacency[edge.source].push({
      to: edge.target,
      cost: forwardCost.cost,
      modifiers: forwardCost.modifiers
    });

    adjacency[edge.target].push({
      to: edge.source,
      cost: reverseCost.cost,
      modifiers: reverseCost.modifiers
    });
  }

  for (const nodeId of Object.keys(adjacency)) {
    adjacency[nodeId] = adjacency[nodeId].sort((a, b) => a.to.localeCompare(b.to));
  }

  return adjacency;
}

export function reconstructPath(
  predecessorById: Record<string, string | null>,
  sourceId: string,
  targetId: string
): string[] {
  if (sourceId === targetId) {
    return [sourceId];
  }

  if (!(targetId in predecessorById)) {
    return [];
  }

  const path: string[] = [];
  let current: string | null = targetId;

  while (current) {
    path.push(current);
    if (current === sourceId) {
      return path.reverse();
    }
    current = predecessorById[current] ?? null;
  }

  return [];
}

function resolveEdgeCost(
  fromId: string,
  toId: string,
  weightedAdjacency: WeightedAdjacency
): EdgeCostResult | null {
  const neighbor = weightedAdjacency[fromId]?.find((entry) => entry.to === toId);
  if (!neighbor) {
    return null;
  }

  return {
    cost: neighbor.cost,
    modifiers: neighbor.modifiers
  };
}

export function buildPathResult(
  nodeIds: string[],
  nodeById: Record<string, PersonNode>,
  weightedAdjacency: WeightedAdjacency
): PathResult {
  if (nodeIds.length === 0) {
    return {
      nodeIds: [],
      totalCost: Number.POSITIVE_INFINITY,
      hopCount: Number.POSITIVE_INFINITY,
      edgeBreakdowns: [],
      reachable: false
    };
  }

  const edgeBreakdowns: PathEdgeBreakdown[] = [];
  let totalCost = 0;

  for (let idx = 0; idx < nodeIds.length - 1; idx += 1) {
    const fromId = nodeIds[idx];
    const toId = nodeIds[idx + 1];
    const costResult = resolveEdgeCost(fromId, toId, weightedAdjacency);

    if (!costResult) {
      continue;
    }

    totalCost += costResult.cost;
    edgeBreakdowns.push({
      fromId,
      toId,
      fromName: nodeById[fromId]?.name ?? fromId,
      toName: nodeById[toId]?.name ?? toId,
      cost: costResult.cost,
      modifiers: costResult.modifiers
    });
  }

  return {
    nodeIds,
    totalCost,
    hopCount: Math.max(0, nodeIds.length - 1),
    edgeBreakdowns,
    reachable: true
  };
}

export function createYouNode(profile: UserProfile): PersonNode {
  return {
    id: "you",
    name: profile.name?.trim() || "You",
    company: "Personal Profile",
    role: profile.targetRoleType || "Candidate",
    school: profile.school,
    orgs: profile.orgs,
    gradYear: profile.gradYear,
    degree: 0
  };
}

export function addYouEdges(nodes: PersonNode[], existingEdges: NetworkEdge[]): NetworkEdge[] {
  const youConnections = nodes
    .filter((node) => node.id !== "you" && node.degree === 1)
    .map((node) => ({ source: "you", target: node.id }));

  return [...existingEdges, ...youConnections];
}

export function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((value, index) => value === b[index]);
}
