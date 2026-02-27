"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Controls, MarkerType, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";
import type { NetworkEdge, PersonNode } from "@/lib/types";

interface GraphCanvasProps {
  nodes: PersonNode[];
  edges: NetworkEdge[];
  weightedPath: string[];
  shortestPath: string[];
}

function edgeInPath(source: string, target: string, path: string[]): boolean {
  for (let idx = 0; idx < path.length - 1; idx += 1) {
    const a = path[idx];
    const b = path[idx + 1];
    if ((a === source && b === target) || (a === target && b === source)) {
      return true;
    }
  }
  return false;
}

function createFocusSet(pathA: string[], pathB: string[]): Set<string> {
  const ids = new Set<string>();
  for (const nodeId of [...pathA, ...pathB]) {
    ids.add(nodeId);
  }
  return ids;
}

export function GraphCanvas({ nodes, edges, weightedPath, shortestPath }: GraphCanvasProps) {
  const graphData = useMemo(() => {
    const focusSet = createFocusSet(weightedPath, shortestPath);
    if (focusSet.size === 0) {
      return { flowNodes: [] as Node[], flowEdges: [] as Edge[] };
    }

    const focusedNodes = nodes.filter((node) => focusSet.has(node.id));
    const count = focusedNodes.length;

    const flowNodes: Node[] = focusedNodes.map((node, index) => {
      const angle = (index / Math.max(count, 1)) * Math.PI * 2;
      const radius = 210 + (index % 3) * 26;
      const isYou = node.id === "you";

      return {
        id: node.id,
        data: {
          label: `${node.name}${isYou ? " (You)" : ""}`
        },
        position: {
          x: 280 + Math.cos(angle) * radius,
          y: 240 + Math.sin(angle) * radius
        },
        style: {
          border: isYou ? "1px solid rgba(0, 251, 255, 0.9)" : "1px solid rgba(140, 162, 189, 0.4)",
          background: isYou ? "rgba(0, 251, 255, 0.14)" : "rgba(17, 22, 35, 0.95)",
          color: "#eaf5ff",
          fontSize: 12,
          borderRadius: 10,
          padding: 8,
          width: 170
        }
      };
    });

    const flowEdges: Edge[] = edges
      .filter((edge) => focusSet.has(edge.source) && focusSet.has(edge.target))
      .map((edge) => {
        const onWeightedPath = edgeInPath(edge.source, edge.target, weightedPath);
        const onShortestPath = edgeInPath(edge.source, edge.target, shortestPath);

        let stroke = "rgba(140, 162, 189, 0.3)";
        let className = "";
        let strokeWidth = 1.2;
        let strokeDasharray: string | undefined;

        if (onWeightedPath) {
          stroke = "rgba(0, 251, 255, 0.95)";
          className = "path-edge-weighted";
          strokeWidth = 2.6;
        }

        if (onShortestPath && !onWeightedPath) {
          stroke = "rgba(255, 141, 47, 0.95)";
          className = "path-edge-shortest";
          strokeWidth = 2.4;
          strokeDasharray = "8 5";
        }

        return {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: stroke
          },
          className,
          style: {
            stroke,
            strokeWidth,
            strokeDasharray
          }
        };
      });

    return { flowNodes, flowEdges };
  }, [nodes, edges, weightedPath, shortestPath]);

  return (
    <section className="rounded-xl border border-cyan-500/20 bg-panel p-3">
      <h2 className="px-1 text-sm font-semibold uppercase tracking-wider text-cyan-100">Path Graph</h2>
      <div className="mt-3 h-[560px] overflow-hidden rounded-lg border border-cyan-400/15 bg-panel2">
        <ReactFlow
          nodes={graphData.flowNodes}
          edges={graphData.flowEdges}
          fitView
          fitViewOptions={{ padding: 0.25 }}
        >
          <Background color="rgba(0, 251, 255, 0.16)" gap={24} />
          <Controls position="bottom-right" />
        </ReactFlow>
      </div>
    </section>
  );
}
