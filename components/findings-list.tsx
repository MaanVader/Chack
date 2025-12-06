// components/findings-list.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface FindingsListProps {
  assessmentId: string;
  userId: string;
}

export default function FindingsList({
  assessmentId,
  userId,
}: FindingsListProps) {
  const findings = useQuery(api.findings.list, { assessmentId }) ?? [];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Findings</h2>
        <div className="text-sm text-slate-400">
          {findings.length} {findings.length === 1 ? "finding" : "findings"}
        </div>
      </div>

      <div className="space-y-2">
        {findings.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
            <p className="text-sm text-slate-400">
              No findings yet. Findings will appear here once the scan completes.
            </p>
          </div>
        ) : (
          findings.map((finding) => (
            <div
              key={finding._id}
              className={`rounded-lg border p-4 ${getSeverityColor(finding.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{finding.title}</h3>
                    <span className="rounded px-2 py-0.5 text-xs font-medium capitalize bg-slate-900/50">
                      {finding.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm opacity-90">{finding.description}</p>
                  {finding.location && (
                    <p className="mt-2 text-xs opacity-75">
                      Location: {finding.location}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs opacity-75">
                    <span className="capitalize">Status: {finding.status}</span>
                    {finding.cvssScore && (
                      <span>CVSS: {finding.cvssScore.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

