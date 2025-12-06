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

  const projects = useQuery(api.projects.list, { orgId }) ?? [];
  const createProject = useMutation(api.projects.create);

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
          <p className="text-sm text-muted-foreground mt-1">Manage and view all your security projects</p>
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
        {projects.length === 0 ? (
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
              className="block rounded-lg border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md hover:bg-card/80 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-lg text-foreground">{project.name}</h3>
                  {project.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary/90 capitalize text-xs font-medium">
                      {project.status}
                    </span>
                  </div>
                </div>
                <span className="ml-4 text-primary text-xl font-light">→</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

