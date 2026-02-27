export type EdgeModifierType =
  | "same_school"
  | "shared_org"
  | "first_degree_you"
  | "same_grad_year";

export interface EdgeModifier {
  type: EdgeModifierType;
  value: number;
  reason: string;
}

export interface PersonNode {
  id: string;
  name: string;
  company: string;
  role: string;
  school: string;
  orgs: string[];
  gradYear?: number;
  degree: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
}

export interface GraphEdge extends NetworkEdge {
  baseCost: number;
  computedCost: number;
  modifiers: EdgeModifier[];
}

export interface NetworkDataset {
  nodes: PersonNode[];
  edges: NetworkEdge[];
  metadata: {
    version: string;
    seed: number;
    nodeCount: number;
    edgeCount: number;
    generatedAt: string;
    hash: string;
  };
}

export interface UserProfile {
  name?: string;
  school: string;
  gradYear?: number;
  orgs: string[];
  targetRoleType?: string;
}

export interface BfsResult {
  distanceById: Record<string, number>;
  predecessorById: Record<string, string | null>;
}

export interface DijkstraResult {
  distanceById: Record<string, number>;
  predecessorById: Record<string, string | null>;
}

export interface WeightedNeighbor {
  to: string;
  cost: number;
  modifiers: EdgeModifier[];
}

export type UnweightedAdjacency = Record<string, string[]>;
export type WeightedAdjacency = Record<string, WeightedNeighbor[]>;

export interface PathEdgeBreakdown {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  cost: number;
  modifiers: EdgeModifier[];
}

export interface PathResult {
  nodeIds: string[];
  totalCost: number;
  hopCount: number;
  edgeBreakdowns: PathEdgeBreakdown[];
  reachable: boolean;
}

export interface CandidateRanking {
  candidateId: string;
  candidateName: string;
  company: string;
  weightedCost: number;
  hopCount: number;
  weightedPath: string[];
  shortestPath: string[];
  pathDiffers: boolean;
}

export interface PerfMetrics {
  nodeCount: number;
  edgeCount: number;
  bfsRuntimeMs: number;
  dijkstraRuntimeMs: number;
}
