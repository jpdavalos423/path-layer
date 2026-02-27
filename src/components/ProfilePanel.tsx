"use client";

import { useMemo, useState } from "react";
import type { UserProfile } from "@/lib/types";

interface ProfilePanelProps {
  profile: UserProfile;
  onChange: (next: UserProfile) => void;
  schools: string[];
  organizations: string[];
}

export function ProfilePanel({ profile, onChange, schools, organizations }: ProfilePanelProps) {
  const [customOrg, setCustomOrg] = useState("");

  const selectedOrgSet = useMemo(() => new Set(profile.orgs), [profile.orgs]);

  const toggleOrg = (org: string) => {
    if (selectedOrgSet.has(org)) {
      onChange({ ...profile, orgs: profile.orgs.filter((existing) => existing !== org) });
      return;
    }

    onChange({ ...profile, orgs: [...profile.orgs, org] });
  };

  const addCustomOrg = () => {
    const next = customOrg.trim();
    if (!next || selectedOrgSet.has(next)) {
      return;
    }

    onChange({ ...profile, orgs: [...profile.orgs, next] });
    setCustomOrg("");
  };

  return (
    <section className="rounded-xl border border-cyan-500/20 bg-panel p-4 shadow-glow">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-100">Profile</h2>
      <div className="mt-3 space-y-3 text-sm">
        <label className="block">
          <span className="mb-1 block text-textdim">Name (optional)</span>
          <input
            className="w-full rounded-md border border-cyan-400/20 bg-panel2 px-3 py-2"
            value={profile.name ?? ""}
            onChange={(event) => onChange({ ...profile, name: event.target.value })}
            placeholder="You"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-textdim">School</span>
          <select
            className="w-full rounded-md border border-cyan-400/20 bg-panel2 px-3 py-2"
            value={profile.school}
            onChange={(event) => onChange({ ...profile, school: event.target.value })}
          >
            {schools.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-textdim">Graduation Year (optional)</span>
          <input
            className="w-full rounded-md border border-cyan-400/20 bg-panel2 px-3 py-2"
            type="number"
            min={2018}
            max={2034}
            value={profile.gradYear ?? ""}
            onChange={(event) => {
              const raw = event.target.value;
              onChange({ ...profile, gradYear: raw ? Number(raw) : undefined });
            }}
            placeholder="2027"
          />
        </label>

        <div>
          <span className="mb-2 block text-textdim">Organizations</span>
          <div className="grid max-h-40 grid-cols-1 gap-2 overflow-auto rounded-md border border-cyan-500/15 bg-panel2 p-2">
            {organizations.map((org) => (
              <label key={org} className="flex items-center gap-2 text-xs text-cyan-50/90">
                <input
                  type="checkbox"
                  checked={selectedOrgSet.has(org)}
                  onChange={() => toggleOrg(org)}
                />
                <span>{org}</span>
              </label>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 rounded-md border border-cyan-400/20 bg-panel2 px-3 py-2 text-xs"
              value={customOrg}
              onChange={(event) => setCustomOrg(event.target.value)}
              placeholder="Add custom organization"
            />
            <button
              type="button"
              className="rounded-md border border-cyan-400/40 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-400/10"
              onClick={addCustomOrg}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
