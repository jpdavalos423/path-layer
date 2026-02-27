"use client";

import { useMemo, useState } from "react";

interface ControlBarProps {
  companies: string[];
  targetCompany: string;
  onTargetCompanyChange: (company: string) => void;
  topN: number;
  onTopNChange: (value: number) => void;
}

export function ControlBar({
  companies,
  targetCompany,
  onTargetCompanyChange,
  topN,
  onTopNChange
}: ControlBarProps) {
  const [query, setQuery] = useState("");

  const filteredCompanies = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return companies;
    }

    return companies.filter((company) => company.toLowerCase().includes(normalized));
  }, [companies, query]);

  return (
    <section className="animate-floatIn rounded-xl border border-cyan-500/20 bg-panel p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-textdim">Search Companies</span>
          <input
            className="w-full rounded-md border border-cyan-400/20 bg-panel2 px-3 py-2"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Amazon"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-textdim">Target Company</span>
          <select
            className="w-full rounded-md border border-cyan-400/20 bg-panel2 px-3 py-2"
            value={targetCompany}
            onChange={(event) => onTargetCompanyChange(event.target.value)}
          >
            {filteredCompanies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-textdim">Top N</span>
          <select
            className="w-full rounded-md border border-cyan-400/20 bg-panel2 px-3 py-2"
            value={topN}
            onChange={(event) => onTopNChange(Number(event.target.value))}
          >
            {[5, 10, 15, 20].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
