// components/dashboard-content.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProjectsList from "./projects-list";

interface DashboardContentProps {
  userId: string;
}

export default function DashboardContent({ userId }: DashboardContentProps) {
  const defaultOrg = useQuery(api.auth.getDefaultOrg, { userId });

  if (defaultOrg === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary"></div>
        <p className="text-sm text-muted-foreground mt-6 font-display">Loading your dashboard...</p>
      </div>
    );
  }

  if (!defaultOrg) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground font-display">
          No organization found. Please complete onboarding.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ProjectsList orgId={defaultOrg._id} />
    </div>
  );
}

