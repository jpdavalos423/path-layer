"use client";

import type { CandidateRanking } from "@/lib/types";

interface RankingTableProps {
  rankings: CandidateRanking[];
  selectedCandidateId?: string;
  onSelect: (candidateId: string) => void;
}

export function RankingTable({ rankings, selectedCandidateId, onSelect }: RankingTableProps) {
  return (
    <section className="rounded-xl border border-cyan-500/20 bg-panel p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-100">Candidate Rankings</h2>
      <div className="mt-3 overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-textdim">
            <tr>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Friction</th>
              <th className="px-2 py-2">Hops</th>
              <th className="px-2 py-2">Differs?</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((candidate) => {
              const isSelected = candidate.candidateId === selectedCandidateId;
              return (
                <tr
                  key={candidate.candidateId}
                  className={`cursor-pointer border-t border-cyan-500/10 ${
                    isSelected ? "bg-cyan-400/10" : "hover:bg-cyan-400/5"
                  }`}
                  onClick={() => onSelect(candidate.candidateId)}
                >
                  <td className="px-2 py-2 text-cyan-50">{candidate.candidateName}</td>
                  <td className="px-2 py-2 font-mono text-cyan-200">{candidate.weightedCost.toFixed(0)}</td>
                  <td className="px-2 py-2 font-mono text-cyan-200">{candidate.hopCount}</td>
                  <td className="px-2 py-2">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        candidate.pathDiffers
                          ? "bg-amber-300/15 text-amber-200"
                          : "bg-cyan-300/15 text-cyan-200"
                      }`}
                    >
                      {candidate.pathDiffers ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {rankings.length === 0 && (
              <tr>
                <td className="px-2 py-3 text-textdim" colSpan={4}>
                  No reachable employees for this company.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
