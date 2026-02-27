"use client";

import { useEffect, useMemo, useState } from "react";
import { ControlBar } from "@/components/ControlBar";
import { GraphCanvas } from "@/components/GraphCanvas";
import { PathDetailsPanel } from "@/components/PathDetailsPanel";
import { PerfDrawer } from "@/components/PerfDrawer";
import { ProfilePanel } from "@/components/ProfilePanel";
import { RankingTable } from "@/components/RankingTable";
import {
  buildPathResult,
} from "@/lib/graph";
import { computeEngineState } from "@/lib/engine";
import type { NetworkDataset, PerfMetrics, UserProfile, WeightedAdjacency } from "@/lib/types";

const NON_TARGET_COMPANIES = new Set(["Student Network", "Personal Profile"]);

const EMPTY_METRICS: PerfMetrics = {
  nodeCount: 0,
  edgeCount: 0,
  bfsRuntimeMs: 0,
  dijkstraRuntimeMs: 0
};

const EMPTY_WEIGHTED_ADJACENCY: WeightedAdjacency = {};

export default function HomePage() {
  const [dataset, setDataset] = useState<NetworkDataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    school: "",
    gradYear: undefined,
    orgs: []
  });
  const [targetCompany, setTargetCompany] = useState("");
  const [topN, setTopN] = useState(10);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let active = true;

    fetch("/data/network.json")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load dataset: ${response.status}`);
        }
        return response.json();
      })
      .then((json: NetworkDataset) => {
        if (!active) {
          return;
        }
        setDataset(json);
      })
      .catch((fetchError: Error) => {
        if (!active) {
          return;
        }
        setError(fetchError.message);
      });

    return () => {
      active = false;
    };
  }, []);

  const schools = useMemo(() => {
    if (!dataset) {
      return [];
    }

    return [...new Set(dataset.nodes.map((node) => node.school))].sort((a, b) => a.localeCompare(b));
  }, [dataset]);

  const organizations = useMemo(() => {
    if (!dataset) {
      return [];
    }

    return [...new Set(dataset.nodes.flatMap((node) => node.orgs))]
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 20);
  }, [dataset]);

  const companies = useMemo(() => {
    if (!dataset) {
      return [];
    }

    const counts: Record<string, number> = {};
    for (const node of dataset.nodes) {
      if (NON_TARGET_COMPANIES.has(node.company)) {
        continue;
      }
      counts[node.company] = (counts[node.company] ?? 0) + 1;
    }

    return Object.entries(counts)
      .filter(([, count]) => count >= 3)
      .map(([company]) => company)
      .sort((a, b) => a.localeCompare(b));
  }, [dataset]);

  useEffect(() => {
    if (!dataset || schools.length === 0 || organizations.length === 0) {
      return;
    }

    setProfile((previous) => ({
      name: previous.name,
      school: previous.school || schools[0],
      gradYear: previous.gradYear,
      orgs: previous.orgs.length > 0 ? previous.orgs : organizations.slice(0, 2)
    }));
  }, [dataset, schools, organizations]);

  useEffect(() => {
    if (!targetCompany && companies.length > 0) {
      setTargetCompany(companies[0]);
    }
  }, [companies, targetCompany]);

  const computed = useMemo(() => {
    if (!dataset || !profile.school) {
      return null;
    }
    if (!targetCompany) {
      return null;
    }

    return computeEngineState(dataset, profile, targetCompany, topN);
  }, [dataset, profile, targetCompany, topN]);

  const selectedCandidate = useMemo(() => {
    if (!computed) {
      return undefined;
    }

    return (
      computed.rankings.find((candidate) => candidate.candidateId === selectedCandidateId) ??
      computed.rankings[0]
    );
  }, [computed, selectedCandidateId]);

  useEffect(() => {
    if (!selectedCandidate) {
      setSelectedCandidateId(undefined);
      return;
    }

    setSelectedCandidateId(selectedCandidate.candidateId);
  }, [selectedCandidate?.candidateId]);

  const weightedPath = useMemo(() => {
    if (!computed || !selectedCandidate) {
      return buildPathResult([], {}, EMPTY_WEIGHTED_ADJACENCY);
    }

    return buildPathResult(
      selectedCandidate.weightedPath,
      computed.nodeById,
      computed.weightedAdjacency
    );
  }, [computed, selectedCandidate]);

  const shortestPath = useMemo(() => {
    if (!computed || !selectedCandidate) {
      return buildPathResult([], {}, EMPTY_WEIGHTED_ADJACENCY);
    }

    return buildPathResult(
      selectedCandidate.shortestPath,
      computed.nodeById,
      computed.weightedAdjacency
    );
  }, [computed, selectedCandidate]);

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</p>
      </main>
    );
  }

  if (!dataset || !computed) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <p className="rounded-xl border border-cyan-500/20 bg-panel p-4 text-cyan-100">Loading PathLayer...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 p-4 lg:grid-cols-[330px_1fr]">
      <aside className="space-y-4">
        <header className="rounded-xl border border-cyan-500/20 bg-panel p-4">
          <h1 className="text-2xl font-semibold tracking-tight text-cyan-100">PathLayer</h1>
          <p className="mt-1 text-sm text-textdim">Graph-Based Referral Optimization Engine</p>
          <p className="mt-2 text-xs text-textdim">Compare shortest-hop vs minimum-friction introductions.</p>
        </header>

        <ProfilePanel
          profile={profile}
          onChange={setProfile}
          schools={schools}
          organizations={organizations}
        />
        <PerfDrawer metrics={computed.metrics ?? EMPTY_METRICS} />
      </aside>

      <section className="space-y-4">
        <ControlBar
          companies={companies}
          targetCompany={targetCompany}
          onTargetCompanyChange={setTargetCompany}
          topN={topN}
          onTopNChange={setTopN}
        />

        <div className="grid gap-4 xl:grid-cols-[440px_1fr]">
          <div className="space-y-4">
            <div data-testid="ranking-table">
              <RankingTable
                rankings={computed.rankings}
                selectedCandidateId={selectedCandidateId}
                onSelect={setSelectedCandidateId}
              />
            </div>
            <div data-testid="path-details">
              <PathDetailsPanel
                candidate={selectedCandidate}
                weightedPath={weightedPath}
                shortestPath={shortestPath}
                nodeById={computed.nodeById}
              />
            </div>
          </div>

          <div data-testid="graph-canvas">
            <GraphCanvas
              nodes={computed.graphNodes}
              edges={computed.graphEdges}
              weightedPath={selectedCandidate?.weightedPath ?? []}
              shortestPath={selectedCandidate?.shortestPath ?? []}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
