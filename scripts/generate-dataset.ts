import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface PersonNode {
  id: string;
  name: string;
  company: string;
  role: string;
  school: string;
  orgs: string[];
  gradYear?: number;
  degree: number;
}

interface NetworkEdge {
  source: string;
  target: string;
}

const SEED = 20260227;
const NODE_COUNT = 420;
const STUDENT_COUNT = Math.floor(NODE_COUNT * 0.6);
const ALUMNI_COUNT = Math.floor(NODE_COUNT * 0.2);
const RECRUITER_COUNT = Math.floor(NODE_COUNT * 0.1);
const OTHER_COUNT = NODE_COUNT - STUDENT_COUNT - ALUMNI_COUNT - RECRUITER_COUNT;

const TARGET_COMPANIES = [
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
];

const OTHER_COMPANIES = [
  "Arcfield Labs",
  "Lattice Robotics",
  "Solara Bio",
  "Vector Forge",
  "Nova Research"
];

const SCHOOLS = [
  "UCSD",
  "UCLA",
  "USC",
  "UC Berkeley",
  "Stanford",
  "Caltech",
  "MIT",
  "Georgia Tech",
  "UT Austin",
  "University of Washington",
  "CMU",
  "Cornell",
  "Princeton",
  "Harvard",
  "Yale",
  "Columbia"
];

const ORGS = [
  "ACM",
  "IEEE",
  "SWE",
  "NSBE",
  "SHPE",
  "Triton Software Engineering",
  "AI Club",
  "Women in Tech",
  "Hack4Impact",
  "Data Science Society",
  "Product Space",
  "Cloud Guild",
  "Cyber Collective",
  "Quant Group",
  "Robotics Team",
  "Startup Studio",
  "Design Co-op",
  "Research Circle"
];

const FIRST_NAMES = [
  "Alex",
  "Riley",
  "Taylor",
  "Jordan",
  "Casey",
  "Avery",
  "Morgan",
  "Cameron",
  "Sydney",
  "Reese",
  "Rowan",
  "Skyler",
  "Quinn",
  "Parker",
  "Drew",
  "Elliot",
  "Harper",
  "Kendall",
  "Kai",
  "Jules"
];

const LAST_NAMES = [
  "Nguyen",
  "Patel",
  "Kim",
  "Rodriguez",
  "Garcia",
  "Lee",
  "Johnson",
  "Smith",
  "Davis",
  "Miller",
  "Chen",
  "Gonzalez",
  "Martinez",
  "Brown",
  "Lopez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Moore",
  "Martin"
];

const STUDENT_ROLES = ["CS Student", "Data Science Student", "EE Student", "Math Student"];
const ALUMNI_ROLES = ["Software Engineer", "ML Engineer", "Product Engineer", "Data Engineer"];
const RECRUITER_ROLES = ["University Recruiter", "Technical Recruiter", "Talent Recruiter"];
const OTHER_ROLES = ["Research Scientist", "Product Manager", "Founder", "DevRel Engineer"];

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const random = createRng(SEED);

function pickOne<T>(items: T[]): T {
  return items[Math.floor(random() * items.length)];
}

function pickSample<T>(items: T[], min: number, max: number): T[] {
  const target = min + Math.floor(random() * (max - min + 1));
  const pool = [...items];
  const sample: T[] = [];

  while (sample.length < target && pool.length > 0) {
    const idx = Math.floor(random() * pool.length);
    sample.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return sample;
}

function randomYear(min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

function similarityScore(a: PersonNode, b: PersonNode): number {
  let score = 0;
  if (a.school === b.school) {
    score += 2;
  }

  const sharedOrgCount = a.orgs.filter((org) => b.orgs.includes(org)).length;
  score += sharedOrgCount * 2;

  if (a.company === b.company) {
    score += 1;
  }

  if (a.gradYear && b.gradYear && Math.abs(a.gradYear - b.gradYear) <= 1) {
    score += 1;
  }

  return score;
}

function edgeProbability(a: PersonNode, b: PersonNode): number {
  let probability = 0.004;

  if (a.school === b.school) {
    probability += 0.045;
  }

  const sharedOrgCount = a.orgs.filter((org) => b.orgs.includes(org)).length;
  probability += Math.min(0.18, sharedOrgCount * 0.055);

  if (a.company === b.company && a.company !== "Student Network") {
    probability += 0.03;
  }

  if (a.gradYear && b.gradYear && Math.abs(a.gradYear - b.gradYear) <= 1) {
    probability += 0.02;
  }

  if (a.degree === 1 || b.degree === 1) {
    probability += 0.01;
  }

  return Math.min(probability, 0.6);
}

function edgeKey(source: string, target: string): string {
  return source < target ? `${source}|${target}` : `${target}|${source}`;
}

function createNode(index: number, cohort: "student" | "alumni" | "recruiter" | "other"): PersonNode {
  const id = `n${String(index + 1).padStart(4, "0")}`;
  const name = `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`;
  const school = pickOne(SCHOOLS);
  const orgs = pickSample(ORGS, 1, 3);

  if (cohort === "student") {
    return {
      id,
      name,
      company: "Student Network",
      role: pickOne(STUDENT_ROLES),
      school,
      orgs,
      gradYear: randomYear(2026, 2030),
      degree: random() < 0.35 ? 1 : 2
    };
  }

  if (cohort === "alumni") {
    return {
      id,
      name,
      company: pickOne(TARGET_COMPANIES),
      role: pickOne(ALUMNI_ROLES),
      school,
      orgs,
      gradYear: randomYear(2019, 2028),
      degree: random() < 0.45 ? 1 : 2
    };
  }

  if (cohort === "recruiter") {
    return {
      id,
      name,
      company: pickOne(TARGET_COMPANIES),
      role: pickOne(RECRUITER_ROLES),
      school,
      orgs,
      gradYear: randomYear(2016, 2027),
      degree: random() < 0.2 ? 1 : 2
    };
  }

  return {
    id,
    name,
    company: random() < 0.7 ? pickOne(OTHER_COMPANIES) : pickOne(TARGET_COMPANIES),
    role: pickOne(OTHER_ROLES),
    school,
    orgs,
    gradYear: randomYear(2014, 2028),
    degree: random() < 0.25 ? 1 : 2
  };
}

function generateNodes(): PersonNode[] {
  const nodes: PersonNode[] = [];

  for (let idx = 0; idx < STUDENT_COUNT; idx += 1) {
    nodes.push(createNode(nodes.length, "student"));
  }

  for (let idx = 0; idx < ALUMNI_COUNT; idx += 1) {
    nodes.push(createNode(nodes.length, "alumni"));
  }

  for (let idx = 0; idx < RECRUITER_COUNT; idx += 1) {
    nodes.push(createNode(nodes.length, "recruiter"));
  }

  for (let idx = 0; idx < OTHER_COUNT; idx += 1) {
    nodes.push(createNode(nodes.length, "other"));
  }

  return nodes;
}

function generateEdges(nodes: PersonNode[]): NetworkEdge[] {
  const edgeSet = new Set<string>();

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      if (random() < edgeProbability(a, b)) {
        edgeSet.add(edgeKey(a.id, b.id));
      }
    }
  }

  for (const node of nodes) {
    const currentDegree = [...edgeSet].filter((key) => key.includes(node.id)).length;
    if (currentDegree >= 2) {
      continue;
    }

    const candidate = nodes
      .filter((other) => other.id !== node.id)
      .sort((a, b) => similarityScore(node, b) - similarityScore(node, a))[0];

    if (candidate) {
      edgeSet.add(edgeKey(node.id, candidate.id));
    }
  }

  for (let idx = 0; idx < 180; idx += 1) {
    const a = pickOne(nodes);
    const b = pickOne(nodes);
    if (a.id !== b.id) {
      edgeSet.add(edgeKey(a.id, b.id));
    }
  }

  return [...edgeSet]
    .map((key) => {
      const [source, target] = key.split("|");
      return { source, target };
    })
    .sort((a, b) => (a.source === b.source ? a.target.localeCompare(b.target) : a.source.localeCompare(b.source)));
}

function computeHash(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function main(): void {
  const nodes = generateNodes();
  const edges = generateEdges(nodes);

  const payload = {
    nodes,
    edges,
    metadata: {
      version: "1.2",
      seed: SEED,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      generatedAt: "2026-02-27T00:00:00.000Z",
      hash: ""
    }
  };

  payload.metadata.hash = computeHash({ nodes: payload.nodes, edges: payload.edges, seed: payload.metadata.seed });

  const outDir = join(process.cwd(), "public", "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "network.json");
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  process.stdout.write(`Generated dataset at ${outPath}\n`);
  process.stdout.write(`Nodes: ${nodes.length}, edges: ${edges.length}\n`);
}

main();
