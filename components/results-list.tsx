// components/results-list.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ResultsListProps {
  assessmentId: string;
  userId: string;
}

export default function ResultsList({
  assessmentId,
  userId,
}: ResultsListProps) {
  const results = useQuery(api.results.list, { assessmentId }) ?? [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Results</h2>
        <div className="text-sm text-slate-400">
          {results.length} {results.length === 1 ? "result" : "results"}
        </div>
      </div>

      <div className="space-y-2">
        {results.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
            <p className="text-sm text-slate-400">
              No results yet. Results will appear here once the scan completes.
            </p>
          </div>
        ) : (
          results.map((result) => (
            <div
              key={result._id}
              className="rounded-lg border border-slate-800 bg-slate-900 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold capitalize">{result.type}</h3>
                    <span className="text-xs text-slate-500">
                      {new Date(result.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <pre className="mt-2 text-xs text-slate-300 bg-slate-800 p-3 rounded overflow-x-auto">
                    {result.data}
                  </pre>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

