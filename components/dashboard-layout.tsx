// components/dashboard-layout.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import DashboardSidebar from "./dashboard-sidebar";
import DashboardContent from "./dashboard-content";

interface DashboardLayoutProps {
  userId: string;
}

export default function DashboardLayout({ userId }: DashboardLayoutProps) {
  const defaultOrg = useQuery(api.auth.getDefaultOrg, { userId });

  if (defaultOrg === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
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

  return (
    <div className="flex h-screen bg-background pt-16">
      <DashboardSidebar currentOrgId={defaultOrg._id} userId={userId} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 bg-background text-foreground">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground font-display mb-2">Dashboard</h1>
                <p className="text-base text-muted-foreground font-display">
                  Welcome back! Manage your security assessments.
                </p>
              </div>
              <DashboardContent userId={userId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

