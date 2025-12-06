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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded bg-sky-500 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-600"
        >
          {showCreateForm ? "Cancel" : "+ New Project"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={onSubmit} className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              placeholder="My Security Project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Description (optional)
            </label>
            <textarea
              placeholder="Brief description of this project..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={2}
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={!projectName.trim()}
            className="rounded bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create Project
          </button>
        </form>
      )}

      <div className="space-y-2">
        {projects.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
            <p className="text-sm text-slate-400">
              No projects yet. Create your first project to get started.
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              className="block rounded-lg border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-100">{project.name}</h3>
                  {project.description && (
                    <p className="mt-1 text-sm text-slate-400">{project.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                    <span className="capitalize">{project.status}</span>
                  </div>
                </div>
                <span className="ml-4 text-slate-400">→</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

