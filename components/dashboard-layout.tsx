// components/dashboard-layout.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import DashboardSidebar from "./dashboard-sidebar";
import ProjectsList from "./projects-list";

interface DashboardLayoutProps {
  userId: string;
}

export default function DashboardLayout({ userId }: DashboardLayoutProps) {
  const defaultOrg = useQuery(api.auth.getDefaultOrg, { userId });
  const orgStats = useQuery(
    api.organizations.getStats,
    defaultOrg ? { orgId: defaultOrg._id } : "skip"
  );

  if (defaultOrg === undefined) {
    return (
      <div className="flex h-screen bg-background pt-16">
        {/* Sidebar Skeleton */}
        <aside className="w-64 shrink-0 border-r border-border bg-card/40">
          <div className="p-4 space-y-4 animate-pulse">
            <div className="h-8 w-32 rounded bg-muted/60" />
            <div className="h-10 w-full rounded-lg bg-muted/50" />
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-muted/40" />
              <div className="h-8 w-full rounded bg-muted/50" />
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-8 bg-background">
              <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                  <div className="h-32 rounded-xl bg-muted/40 col-span-2" />
                  <div className="h-32 rounded-xl bg-muted/40" />
                </div>
                <div className="space-y-4">
                  <div className="h-7 w-32 rounded bg-muted/60 animate-pulse" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="h-6 w-48 rounded bg-muted/50" />
                        <div className="h-4 w-full rounded bg-muted/40" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!defaultOrg) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="text-sm text-muted-foreground">No organization found</div>
      </div>
    );
  }

  const credits = 'credits' in defaultOrg && typeof defaultOrg.credits === "number" ? defaultOrg.credits : 0;

  return (
    <div className="flex h-screen bg-background pt-16 overflow-hidden">
      <DashboardSidebar currentOrgId={defaultOrg._id} userId={userId} />
      <main className="flex-1 flex flex-col overflow-hidden bg-background/50 relative">
        <div className="absolute inset-0 bg-dotted-pattern opacity-5 pointer-events-none" />
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-10">
            <div className="mx-auto max-w-6xl space-y-8">

              {/* Header / Welcome Area */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1 text-base">
                    Overview of your security posture and assessments
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    System Operational
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Projects */}
                <div className="p-5 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all group">
                  <div className="text-sm text-muted-foreground font-medium mb-1">Total Projects</div>
                  <div className="text-2xl font-bold font-display group-hover:text-primary transition-colors">
                    {orgStats?.projectsCount ?? "—"}
                  </div>
                </div>

                {/* Assessments Run */}
                <div className="p-5 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all group">
                  <div className="text-sm text-muted-foreground font-medium mb-1">Assessments</div>
                  <div className="text-2xl font-bold font-display group-hover:text-primary transition-colors">
                    {orgStats?.assessmentsCount ?? "—"}
                  </div>
                </div>

                {/* Active Credits */}
                <div className="p-5 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all group relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-sm text-muted-foreground font-medium mb-1">Available Credits</div>
                    <div className="text-2xl font-bold font-display group-hover:text-sky-500 transition-colors">
                      {credits}
                    </div>
                  </div>
                  {/* Subtle decoration for credits */}
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-12 h-12 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>

                {/* Status / Plan */}
                <div className="p-5 rounded-2xl border border-border/60 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm hover:border-indigo-500/20 transition-all">
                  <div className="text-sm text-muted-foreground font-medium mb-1">Current Plan</div>
                  <div className="text-xl font-bold font-display text-indigo-600/90 capitalize flex items-center gap-2">
                    {'plan' in defaultOrg ? defaultOrg.plan : 'Free'}
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="relative">
                <ProjectsList orgId={defaultOrg._id} />
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



