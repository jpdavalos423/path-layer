import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type PersonNode = {
  id: string;
  name: string;
  company: string;
  role: string;
  school: string;
  orgs: string[];
  gradYear?: number;
  degree: number;
};

type NetworkEdge = {
  source: string;
  target: string;
};

type Dataset = {
  nodes: PersonNode[];
  edges: NetworkEdge[];
  metadata: {
    seed: number;
    nodeCount: number;
    edgeCount: number;
    hash: string;
  };
};

const TARGET_COMPANIES = new Set([
  "Amazon",
  "Microsoft",
  "Google",
  "Meta",
  "Stripe",
  "NVIDIA",
  "OpenAI",
  "Anthropic",
  "Databricks",
  "Palantir"
]);

const ALUMNI_ROLES = new Set([
  "Software Engineer",
  "ML Engineer",
  "Product Engineer",
  "Data Engineer"
]);

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function edgeKey(source: string, target: string): string {
  return source < target ? `${source}|${target}` : `${target}|${source}`;
}

function bfs(startId: string, nodes: PersonNode[], edges: NetworkEdge[]): Set<string> {
  const adjacency: Record<string, string[]> = {};
  for (const node of nodes) {
    adjacency[node.id] = [];
  }

  for (const edge of edges) {
    adjacency[edge.source]?.push(edge.target);
    adjacency[edge.target]?.push(edge.source);
  }

  const seen = new Set<string>([startId]);
  const queue = [startId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    for (const next of adjacency[current] ?? []) {
      if (seen.has(next)) {
        continue;
      }
      seen.add(next);
      queue.push(next);
    }
  }

  return seen;
}

function computeHash(dataset: Dataset): string {
  return createHash("sha256")
    .update(JSON.stringify({ nodes: dataset.nodes, edges: dataset.edges, seed: dataset.metadata.seed }))
    .digest("hex");
}

function main(): void {
  const datasetPath = join(process.cwd(), "public", "data", "network.json");
  const dataset = JSON.parse(readFileSync(datasetPath, "utf8")) as Dataset;

  assert(dataset.nodes.length >= 300 && dataset.nodes.length <= 500, "Node count must be between 300 and 500");
  assert(dataset.edges.length > dataset.nodes.length, "Edge count must exceed node count");

  assert(dataset.metadata.nodeCount === dataset.nodes.length, "metadata.nodeCount mismatch");
  assert(dataset.metadata.edgeCount === dataset.edges.length, "metadata.edgeCount mismatch");

  const nodeIds = new Set(dataset.nodes.map((node) => node.id));
  assert(nodeIds.size === dataset.nodes.length, "Node IDs must be unique");

  const uniqueEdges = new Set<string>();
  for (const edge of dataset.edges) {
    assert(edge.source !== edge.target, `Self edge detected on ${edge.source}`);
    assert(nodeIds.has(edge.source), `Edge source missing node: ${edge.source}`);
    assert(nodeIds.has(edge.target), `Edge target missing node: ${edge.target}`);
    uniqueEdges.add(edgeKey(edge.source, edge.target));
  }
  assert(uniqueEdges.size === dataset.edges.length, "Duplicate undirected edges found");

  const students = dataset.nodes.filter((node) => node.company === "Student Network");
  const recruiters = dataset.nodes.filter((node) => node.role.toLowerCase().includes("recruiter"));
  const alumni = dataset.nodes.filter((node) => ALUMNI_ROLES.has(node.role));
  const others = dataset.nodes.filter(
    (node) =>
      node.company !== "Student Network" &&
      !node.role.toLowerCase().includes("recruiter") &&
      !ALUMNI_ROLES.has(node.role)
  );

  const studentRatio = students.length / dataset.nodes.length;
  const alumniRatio = alumni.length / dataset.nodes.length;
  const recruiterRatio = recruiters.length / dataset.nodes.length;
  const otherRatio = others.length / dataset.nodes.length;

  assert(studentRatio >= 0.55 && studentRatio <= 0.65, "Student ratio out of expected range");
  assert(alumniRatio >= 0.18 && alumniRatio <= 0.22, "Alumni ratio out of expected range");
  assert(recruiterRatio >= 0.08 && recruiterRatio <= 0.12, "Recruiter ratio out of expected range");
  assert(otherRatio >= 0.08 && otherRatio <= 0.12, "Other professional ratio out of expected range");

  for (const company of TARGET_COMPANIES) {
    const employeeCount = dataset.nodes.filter((node) => node.company === company).length;
    assert(employeeCount >= 5, `Not enough synthetic employees for company ${company}`);
  }

  const youEdges = dataset.nodes
    .filter((node) => node.degree === 1)
    .map((node) => ({ source: "you", target: node.id }));

  const reachability = bfs(
    "you",
    [
      {
        id: "you",
        name: "You",
        company: "Personal Profile",
        role: "Candidate",
        school: dataset.nodes[0].school,
        orgs: dataset.nodes[0].orgs.slice(0, 2),
        degree: 0
      },
      ...dataset.nodes
    ],
    [...dataset.edges, ...youEdges]
  );

  const targetNodes = dataset.nodes.filter((node) => TARGET_COMPANIES.has(node.company));
  const reachableTargetNodes = targetNodes.filter((node) => reachability.has(node.id)).length;
  const reachableRatio = reachableTargetNodes / Math.max(targetNodes.length, 1);

  assert(reachableRatio >= 0.8, "You node does not reach most target-company employees");

  const hash = computeHash(dataset);
  assert(hash === dataset.metadata.hash, "metadata.hash does not match deterministic payload hash");

  process.stdout.write("Dataset validation passed.\n");
}

main();
