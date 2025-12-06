// components/projects-list.tsx

"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface ProjectsListProps {
  orgId: string;
}

export default function ProjectsList({ orgId }: ProjectsListProps) {
  const { data: session } = useSession();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const projectsData = useQuery(api.projects.list, { orgId });
  const createProject = useMutation(api.projects.create);
  const isLoading = projectsData === undefined;
  const projects = projectsData ?? [];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !projectName.trim()) return;

    await createProject({
      orgId,
      name: projectName,
      description: projectDescription || undefined,
      createdByUserId: session.user.id,
    });

    setProjectName("");
    setProjectDescription("");
    setShowCreateForm(false);
  };

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track assessments, scan readiness, and jump into the next AI run.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-sky-400 hover:to-cyan-400 hover:scale-105 hover:shadow-lg hover:shadow-sky-500/30 transition-all duration-300 font-display"
        >
          {showCreateForm ? "Cancel" : "+ New Project"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 font-display">
              Project Name *
            </label>
            <input
              type="text"
              placeholder="My Security Project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 font-display">
              Description (optional)
            </label>
            <textarea
              placeholder="Brief description of this project..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={!projectName.trim()}
            className="rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white hover:from-sky-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-105 hover:shadow-lg hover:shadow-sky-500/30 transition-all duration-300 font-display"
          >
            Create Project
          </button>
        </form>
      )}

      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border bg-card p-6 animate-pulse space-y-3"
            >
              <div className="h-4 w-40 rounded bg-muted/40" />
              <div className="h-3 w-64 rounded bg-muted/40" />
              <div className="h-3 w-24 rounded bg-muted/30" />
            </div>
          ))
        ) : projects.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground font-display">
              No projects yet. Create your first project to get started.
            </p>
          </div>
        ) : (
          projects.map((project, index) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              className="block rounded-xl border border-border/80 bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:-translate-y-[1px] hover:bg-card/90 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-semibold text-lg text-foreground">
                      {project.name}
                    </h3>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary/90">
                      {project.status || "active"}
                    </span>
                    <RiskBadge status={project.status} />
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Ready for AI scan
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1">
                      Last touch: {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm text-primary font-semibold">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
                    Run AI scan
                    <span aria-hidden>→</span>
                  </span>
                  <span className="text-muted-foreground text-xs font-normal">
                    Opens project details
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

function RiskBadge({ status }: { status?: string }) {
  const normalized = (status || "active").toLowerCase();
  let label = "Low risk";
  let tone = "bg-emerald-500/10 text-emerald-300 border-emerald-400/30";

  if (normalized.includes("pending") || normalized.includes("review")) {
    label = "Reviewing";
    tone = "bg-amber-500/10 text-amber-200 border-amber-400/30";
  } else if (normalized.includes("blocked") || normalized.includes("issue")) {
    label = "Action needed";
    tone = "bg-red-500/10 text-red-200 border-red-400/30";
  }

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  );
}

