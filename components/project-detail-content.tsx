// components/project-detail-content.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import AssessmentsList from "./assessments-list";

interface ProjectDetailContentProps {
  projectId: string;
  userId: string;
}

export default function ProjectDetailContent({
  projectId,
  userId,
}: ProjectDetailContentProps) {
  const project = useQuery(api.projects.get, { projectId });

  if (project === undefined) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
        <p className="text-sm text-slate-400">Project not found</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm text-sky-500 hover:text-sky-400"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-slate-300"
        >
          ← Back to Dashboard
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-slate-400 mt-1">{project.description}</p>
          )}
        </div>
      </div>

      <AssessmentsList projectId={projectId} />
    </div>
  );
}

