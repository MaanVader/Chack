// components/assessment-detail-content.tsx

"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import FindingsList from "./findings-list";
import ResultsList from "./results-list";

interface AssessmentDetailContentProps {
  assessmentId: string;
  userId: string;
}

export default function AssessmentDetailContent({
  assessmentId,
  userId,
}: AssessmentDetailContentProps) {
  const assessment = useQuery(api.assessments.get, { assessmentId });
  const runScan = useMutation(api.assessments.runScan);
  const scanTriggered = useRef(false);

  // Automatically trigger scan after 5 seconds if assessment is running
  useEffect(() => {
    if (assessment?.status === "running" && !scanTriggered.current) {
      scanTriggered.current = true;
      
      const startTime = assessment.startedAt || assessment.createdAt || Date.now();
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 5000 - elapsed);

      const timeoutId = setTimeout(async () => {
        try {
          await runScan({
            assessmentId,
            userId,
          });
        } catch (error) {
          console.error("Failed to run scan:", error);
          scanTriggered.current = false; // Allow retry on error
        }
      }, remainingTime);

      return () => clearTimeout(timeoutId);
    }
  }, [assessment, assessmentId, userId, runScan]);

  if (assessment === undefined) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
        <p className="text-sm text-slate-400">Assessment not found</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm text-sky-500 hover:text-sky-400"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-slate-300"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{assessment.name}</h1>
          {assessment.description && (
            <p className="text-sm text-slate-400 mt-1">{assessment.description}</p>
          )}
        </div>
        <span
          className={`rounded px-3 py-1 text-sm font-medium capitalize ${getStatusColor(
            assessment.status
          )}`}
        >
          {assessment.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="text-xs text-slate-400 uppercase">Type</div>
          <div className="mt-1 text-sm font-medium capitalize">
            {assessment.type}
          </div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="text-xs text-slate-400 uppercase">Target Type</div>
          <div className="mt-1 text-sm font-medium capitalize">
            {assessment.targetType}
          </div>
        </div>
        {assessment.targetUrl && (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs text-slate-400 uppercase">Target URL</div>
            <div className="mt-1 text-sm font-medium truncate">
              {assessment.targetUrl}
            </div>
          </div>
        )}
      </div>

      {assessment.status === "running" ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-sky-500 rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Scan in Progress
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Running security assessment... This may take a few seconds.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <FindingsList assessmentId={assessmentId} userId={userId} />
          <ResultsList assessmentId={assessmentId} userId={userId} />
        </>
      )}
    </div>
  );
}

