"use client";

import type { PerfMetrics } from "@/lib/types";

interface PerfDrawerProps {
  metrics: PerfMetrics;
}

export function PerfDrawer({ metrics }: PerfDrawerProps) {
  return (
    <details className="rounded-xl border border-cyan-500/20 bg-panel p-3 text-sm">
      <summary className="cursor-pointer font-medium text-cyan-100">System Metrics</summary>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-panel2 p-2 font-mono text-xs text-cyan-200">Nodes: {metrics.nodeCount}</div>
        <div className="rounded-md bg-panel2 p-2 font-mono text-xs text-cyan-200">Edges: {metrics.edgeCount}</div>
        <div className="rounded-md bg-panel2 p-2 font-mono text-xs text-cyan-200">
          BFS: {metrics.bfsRuntimeMs.toFixed(2)} ms
        </div>
        <div className="rounded-md bg-panel2 p-2 font-mono text-xs text-cyan-200">
          Dijkstra: {metrics.dijkstraRuntimeMs.toFixed(2)} ms
        </div>
      </div>
    </details>
  );
}
