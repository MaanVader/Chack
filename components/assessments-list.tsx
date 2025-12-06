// components/assessments-list.tsx

"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AssessmentsListProps {
  projectId: string;
}

export default function AssessmentsList({ projectId }: AssessmentsListProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [assessmentType, setAssessmentType] = useState("blackbox");
  const [targetType, setTargetType] = useState("web_app");
  const [targetUrl, setTargetUrl] = useState("");

  const assessments = useQuery(api.assessments.list, { projectId }) ?? [];
  const createAssessment = useMutation(api.assessments.create);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !assessmentName.trim()) return;

    // Create assessment (status will be "running")
    const assessmentId = await createAssessment({
      projectId,
      name: assessmentName,
      description: assessmentDescription || undefined,
      type: assessmentType,
      targetType,
      targetUrl: targetUrl || undefined,
      createdByUserId: session.user.id,
    });

    setAssessmentName("");
    setAssessmentDescription("");
    setTargetUrl("");
    setShowCreateForm(false);

    // Redirect to assessment detail page to show loading state
    // The scan will be automatically triggered on the detail page
    router.push(`/assessments/${assessmentId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "running":
        return "bg-blue-500/20 text-blue-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Assessments</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded bg-sky-500 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-600"
        >
          {showCreateForm ? "Cancel" : "+ New Assessment"}
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={onSubmit}
          className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-3"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Assessment Name *
            </label>
            <input
              type="text"
              placeholder="Security Scan - Q1 2025"
              value={assessmentName}
              onChange={(e) => setAssessmentName(e.target.value)}
              required
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Description (optional)
            </label>
            <textarea
              placeholder="Brief description of this assessment..."
              value={assessmentDescription}
              onChange={(e) => setAssessmentDescription(e.target.value)}
              rows={2}
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Assessment Type *
              </label>
              <select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              >
                <option value="blackbox">Blackbox</option>
                <option value="whitebox">Whitebox</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Target Type *
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              >
                <option value="web_app">Web Application</option>
                <option value="api">API</option>
                <option value="mobile">Mobile App</option>
                <option value="network">Network</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Target URL (optional)
            </label>
            <input
              type="url"
              placeholder="https://app.example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={!assessmentName.trim()}
            className="rounded bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create Assessment
          </button>
        </form>
      )}

      <div className="space-y-2">
        {assessments.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
            <p className="text-sm text-slate-400">
              No assessments yet. Create your first assessment to start scanning.
            </p>
          </div>
        ) : (
          assessments.map((assessment) => (
            <Link
              key={assessment._id}
              href={`/assessments/${assessment._id}`}
              className="block rounded-lg border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-100">{assessment.name}</h3>
                  {assessment.description && (
                    <p className="mt-1 text-sm text-slate-400">
                      {assessment.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                    <span className="capitalize">{assessment.type}</span>
                    <span>•</span>
                    <span className="capitalize">{assessment.targetType}</span>
                    {assessment.targetUrl && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-xs">{assessment.targetUrl}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium capitalize ${getStatusColor(
                      assessment.status
                    )}`}
                  >
                    {assessment.status}
                  </span>
                  <span className="text-slate-400">→</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

