// components/dashboard-sidebar.tsx

"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Settings, Building2 } from "lucide-react";

// Mini projects list for sidebar
function ProjectsList({ orgId }: { orgId: string }) {
  const projects = useQuery(api.organizations.getProjects, { orgId });

  if (projects === undefined) {
    return <div className="text-xs text-muted-foreground px-3 py-2">Loading...</div>;
  }

  if (projects.length === 0) {
    return <div className="text-xs text-muted-foreground px-3 py-2">No projects yet</div>;
  }

  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto">
      {projects.slice(0, 5).map((project, index) => (
        <Link
          key={project._id}
          href={`/projects/${project._id}`}
          className="block rounded-lg px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors truncate"
          title={project.name}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {project.name}
        </Link>
      ))}
      {projects.length > 5 && (
        <div className="text-xs text-muted-foreground px-3 py-1">
          +{projects.length - 5} more
        </div>
      )}
    </div>
  );
}

interface DashboardSidebarProps {
  currentOrgId: string;
  userId: string;
}

export default function DashboardSidebar({
  currentOrgId,
  userId,
}: DashboardSidebarProps) {
  const { data: session } = useSession();
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const currentOrg = useQuery(api.organizations.get, { orgId: currentOrgId });
  const allOrgs = useQuery(api.organizations.listByUser, { userId });
  const members = useQuery(api.organizations.getMembers, { orgId: currentOrgId });
  const stats = useQuery(api.organizations.getStats, { orgId: currentOrgId });
  const user = useQuery(api.users.getById, { userId });

  const creditsValue =
    currentOrg && "credits" in currentOrg ? (currentOrg.credits as number) ?? 0 : 0;
  const creditCap = Math.max(creditsValue, 100);
  const creditPct = Math.min(Math.round((creditsValue / creditCap) * 100), 100);

  return (
    <aside className="w-64 h-full border-r border-border/40 bg-card/50 backdrop-blur-xl text-foreground flex flex-col">
      {/* Scrollable Middle Section */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">

        {/* Navigation / Overview */}
        <div className="space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-secondary/80 text-foreground transition-all">
            <div className="w-1 h-4 rounded-full bg-sky-500" />
            Dashboard
          </Link>
        </div>

        {/* Projects List */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest">
              Projects
            </h3>
          </div>
          <ProjectsList orgId={currentOrgId} />
        </div>

        {/* Team Members */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2 cursor-pointer hover:text-foreground transition-colors group" onClick={() => setShowMembers(!showMembers)}>
            <h3 className="text-xs font-medium text-muted-foreground/70 group-hover:text-muted-foreground uppercase tracking-widest transition-colors">
              Team
            </h3>
            <span className="text-[10px] text-muted-foreground group-hover:text-sky-500 transition-colors">
              {showMembers ? "Hide" : "View"}
            </span>
          </div>

          {showMembers && members && (
            <div className="space-y-1 pl-1">
              {members.map((member) => (
                <div key={member.membershipId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white uppercase shadow-sm">
                    {member.name?.[0] || member.email[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate opacity-90">{member.name || member.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: User Profile & Org Switcher */}
      <div className="p-4 border-t border-border/40 bg-card/30 relative">
        {/* Org Switcher Dropdown (Upwards) */}
        {showOrgSwitcher && allOrgs && allOrgs.length > 1 && (
          <div className="absolute bottom-full left-4 right-4 mb-2 p-1 rounded-xl border border-border bg-popover/95 backdrop-blur shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
            {allOrgs.map((org) => (
              <Link
                key={org._id}
                href="/dashboard"
                onClick={() => setShowOrgSwitcher(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${org._id === currentOrgId
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
              >
                <div className="w-2 h-2 rounded-full bg-current opacity-70" />
                <span className="truncate">{"name" in org ? org.name : ""}</span>
              </Link>
            ))}
          </div>
        )}

        {session && user && (
          <div className="flex items-center gap-3 h-10">
            {/* Avatar */}
            <Link href="/settings" className="shrink-0 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-md group-hover:shadow-emerald-500/20 transition-all">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || user.email}
                    width={36}
                    height={36}
                    className="w-full h-full rounded-full object-cover border-2 border-background"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-emerald-600 font-bold text-xs ring-2 ring-transparent group-hover:ring-emerald-200 transition-all">
                    {(user.name || user.email)[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            </Link>

            {/* Info Section (User Name + Org Name) - Click to Switch Org */}
            <div
              className={`flex-1 min-w-0 flex flex-col justify-center ${allOrgs && allOrgs.length > 1 ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
              onClick={() => allOrgs && allOrgs.length > 1 && setShowOrgSwitcher(!showOrgSwitcher)}
            >
              <div className="text-sm font-semibold text-foreground truncate leading-tight">
                {user.name || "User"}
              </div>
              <div className="text-xs text-muted-foreground truncate flex items-center gap-1 leading-tight">
                {currentOrg && "name" in currentOrg ? currentOrg.name : "Organization"}
                {allOrgs && allOrgs.length > 1 && (
                  <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>

            {/* Settings Link */}
            <Link href="/settings" className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

