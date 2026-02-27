"use client";

import type { CandidateRanking, PathResult, PersonNode } from "@/lib/types";

interface PathDetailsPanelProps {
  candidate?: CandidateRanking;
  weightedPath: PathResult;
  shortestPath: PathResult;
  nodeById: Record<string, PersonNode>;
}

function pathToReadable(nodeIds: string[], nodeById: Record<string, PersonNode>): string {
  return nodeIds.map((nodeId) => nodeById[nodeId]?.name ?? nodeId).join(" -> ");
}

export function PathDetailsPanel({
  candidate,
  weightedPath,
  shortestPath,
  nodeById
}: PathDetailsPanelProps) {
  return (
    <section className="rounded-xl border border-cyan-500/20 bg-panel p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-100">Path Explainability</h2>
      {!candidate && <p className="mt-2 text-sm text-textdim">Select a candidate to inspect path details.</p>}

      {candidate && (
        <div className="mt-3 space-y-4 text-sm">
          <div className="rounded-lg border border-cyan-400/20 bg-panel2 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="text-cyan-100">{candidate.candidateName}</strong>
              <span className="font-mono text-xs text-cyan-200">{candidate.company}</span>
            </div>
            <p className="mt-2 text-xs text-textdim">
              Weighted path is recommended because it minimizes cumulative social friction, not just hops.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-cyan-400/20 bg-panel2 p-3">
              <div className="text-xs uppercase tracking-wide text-cyan-200">Weighted Best Path</div>
              <div className="mt-2 font-mono text-cyan-50">{pathToReadable(weightedPath.nodeIds, nodeById)}</div>
              <div className="mt-2 text-xs text-textdim">
                Friction: {weightedPath.totalCost.toFixed(0)} | Hops: {weightedPath.hopCount}
              </div>
            </div>

            <div className="rounded-lg border border-amber-300/20 bg-panel2 p-3">
              <div className="text-xs uppercase tracking-wide text-amber-200">Shortest Hop Path</div>
              <div className="mt-2 font-mono text-amber-100">{pathToReadable(shortestPath.nodeIds, nodeById)}</div>
              <div className="mt-2 text-xs text-textdim">
                Friction: {shortestPath.totalCost.toFixed(0)} | Hops: {shortestPath.hopCount}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-cyan-400/20 bg-panel2 p-3">
            <div className="text-xs uppercase tracking-wide text-cyan-200">Edge-Level Breakdown</div>
            <ul className="mt-2 space-y-2">
              {weightedPath.edgeBreakdowns.map((edge, index) => (
                <li key={`${edge.fromId}-${edge.toId}-${index}`} className="rounded border border-cyan-500/10 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-cyan-100">
                      {edge.fromName} {"->"} {edge.toName}
                    </span>
                    <span className="font-mono text-xs text-cyan-200">cost {edge.cost}</span>
                  </div>
                  <p className="mt-1 text-xs text-textdim">
                    {edge.modifiers.length > 0
                      ? edge.modifiers.map((modifier) => `${modifier.reason} (${modifier.value})`).join(" | ")
                      : "No relationship modifiers"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
