// components/findings-list.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AlertCircle, AlertTriangle, Info, CheckCircle, FileText, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FindingsListProps {
  assessmentId: string;
  userId: string;
}

export default function FindingsList({
  assessmentId,
  userId,
}: FindingsListProps) {
  const findings = useQuery(api.findings.list, { assessmentId }) ?? [];

  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return {
          wrapper: "border-red-200 bg-red-500/5 dark:border-red-900/50 dark:bg-red-950/20",
          icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
          badge: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
        };
      case "high":
        return {
          wrapper: "border-orange-200 bg-orange-500/5 dark:border-orange-900/50 dark:bg-orange-950/20",
          icon: <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
          badge: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
        };
      case "medium":
        return {
          wrapper: "border-yellow-200 bg-yellow-500/5 dark:border-yellow-900/50 dark:bg-yellow-950/20",
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
          badge: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
        };
      case "low":
        return {
          wrapper: "border-blue-200 bg-blue-500/5 dark:border-blue-900/50 dark:bg-blue-950/20",
          icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          badge: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
        };
      case "info":
      default:
        return {
          wrapper: "border-slate-200 bg-slate-500/5 dark:border-slate-800/50 dark:bg-slate-900/20",
          icon: <Info className="w-5 h-5 text-slate-600 dark:text-slate-400" />,
          badge: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
        };
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">Findings & Vulnerabilities</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Security issues identified during the assessment.
          </p>
        </div>
        <div className="text-sm font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
          {findings.length} {findings.length === 1 ? "Issue" : "Issues"} Found
        </div>
      </div>

      <div className="grid gap-4">
        {findings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/30 p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No findings yet</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Findings will appear here once the scan identifies potential issues.
            </p>
          </div>
        ) : (
          findings.map((finding, index) => {
            const styles = getSeverityStyles(finding.severity);
            return (
              <div
                key={finding._id}
                className={`group relative rounded-xl border p-5 transition-all duration-300 hover:shadow-md ${styles.wrapper}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1 p-2 rounded-lg bg-background/50 border border-border/50 backdrop-blur-sm">
                    {styles.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground tracking-tight group-hover:text-primary transition-colors">
                          {finding.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className={`capitalize font-medium border ${styles.badge}`}>
                            {finding.severity}
                          </Badge>

                          {finding.cvssScore && (
                            <Badge variant="outline" className="bg-background/80">
                              CVSS: {finding.cvssScore.toFixed(1)}
                            </Badge>
                          )}

                          <Badge variant="outline" className="bg-background/80 capitalize">
                            {finding.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {finding.description}
                    </div>

                    {finding.location && (
                      <div className="mt-4 flex items-center gap-2 text-xs font-mono text-muted-foreground bg-background/50 p-2 rounded border border-border/50 w-fit max-w-full">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{finding.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
