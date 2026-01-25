// components/results-list.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FileCode, Clock, FileJson } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">Scan Results</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Raw outputs and artifacts from the security scan.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {results.length} Artifacts
        </Badge>
      </div>

      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/30 p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <FileCode className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No results yet</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Scan results will populate here once the assessment completes.
            </p>
          </div>
        ) : (
          results.map((result, index) => (
            <div
              key={result._id}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all duration-300 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 p-2 rounded-lg bg-secondary/50 border border-border">
                  <FileJson className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize text-foreground flex items-center gap-2">
                      {result.type.replace(/_/g, " ")}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(result.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="relative mt-3 rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs overflow-hidden group-hover:bg-muted/50 transition-colors">
                    <div className="absolute top-2 right-2 text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded border border-border opacity-50 group-hover:opacity-100 transition-opacity">
                      JSON
                    </div>
                    <pre className="overflow-x-auto text-muted-foreground leading-relaxed custom-scrollbar">
                      <code>{JSON.stringify(JSON.parse(result.data), null, 2)}</code>
                    </pre>
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
