// components/projects-list.tsx

"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useToast } from "./toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Activity, Globe, Layout } from "lucide-react";

interface ProjectsListProps {
  orgId: string;
}

export default function ProjectsList({ orgId }: ProjectsListProps) {
  const { data: session } = useSession();
  const { showToast, error: showError, success: showSuccess, ToastComponent } = useToast();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectsData = useQuery(api.projects.list, { orgId });
  const createProject = useMutation(api.projects.create);
  const isLoading = projectsData === undefined;
  const projects = projectsData ?? [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!projectName.trim()) {
      newErrors.name = "Project name is required";
    } else if (projectName.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (projectName.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    if (projectDescription.length > 500) {
      newErrors.description = "Description too long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    if (!session?.user?.id) {
      showError("You need to be logged in");
      return;
    }

    setIsSubmitting(true);

    try {
      await createProject({
        orgId,
        name: projectName,
        description: projectDescription || undefined,
        createdByUserId: session.user.id,
      });

      showSuccess("Project created successfully");
      setProjectName("");
      setProjectDescription("");
      setErrors({});
      setShowCreateDialog(false);
    } catch (error: any) {
      console.error("Project creation error:", error);
      showError(error?.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {ToastComponent}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground tracking-tight">Active Projects</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage and monitor your security projects</p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="font-display">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new security project to organize your assessments.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Website Scan"
                    value={projectName}
                    onChange={(e) => {
                      setProjectName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    className={`flex h-10 w-full rounded-md border ${errors.name ? 'border-red-500 ring-red-500' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                  />
                  {errors.name && (
                    <p className="text-[0.8rem] text-red-500 font-medium">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Description <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <textarea
                    placeholder="Brief description..."
                    value={projectDescription}
                    onChange={(e) => {
                      setProjectDescription(e.target.value);
                      if (errors.description) setErrors({ ...errors, description: "" });
                    }}
                    rows={3}
                    className={`flex min-h-[80px] w-full rounded-md border ${errors.description ? 'border-red-500 ring-red-500' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none`}
                  />
                  {errors.description && (
                    <p className="text-[0.8rem] text-red-500 font-medium">{errors.description}</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={onSubmit} disabled={isSubmitting} className="font-display">
                  {isSubmitting ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            [1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-[200px] rounded-xl border border-border bg-card/50 p-6 animate-pulse"
              />
            ))
          ) : projects.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center bg-card/30">
              <div className="mx-auto w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <Layout className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No projects found</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Get started by creating your first project to organize your security assessments and findings.
              </p>
              <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                Create new project
              </Button>
            </div>
          ) : (
            projects.map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project._id}`}
                className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Updated {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <RiskBadge status={project.status} />
                  </div>

                  <div className="min-h-[2.5rem]">
                    {project.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/40 italic">No description provided</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    {/* Placeholder for future specific project icons/stats */}
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 text-secondary-foreground text-xs font-medium">
                      PM
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    View Project
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </>
  );
}

function RiskBadge({ status }: { status?: string }) {
  const normalized = (status || "active").toLowerCase();

  let styles = "bg-secondary text-secondary-foreground border-transparent";
  let label = "Active";

  if (normalized.includes("processing") || normalized.includes("pending")) {
    styles = "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900";
    label = "Processing";
  } else if (normalized.includes("issue") || normalized.includes("risk")) {
    styles = "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900";
    label = "Risk Found";
  } else if (normalized.includes("archived")) {
    styles = "bg-slate-500/10 text-slate-500 border-slate-200 dark:border-slate-800";
    label = "Archived";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${styles}`}>
      {label}
    </span>
  );
}
