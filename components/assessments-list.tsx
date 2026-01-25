// components/assessments-list.tsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "./toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Target, Github, Globe, Smartphone, Server, ArrowRight, ShieldCheck, AlertCircle, Clock } from "lucide-react";

interface AssessmentsListProps {
  projectId: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  permissions: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export default function AssessmentsList({ projectId }: AssessmentsListProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, error: showError, success: showSuccess, ToastComponent } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [assessmentType, setAssessmentType] = useState<"blackbox" | "whitebox" | "auto">("auto");
  const [targetType, setTargetType] = useState("web_app");
  const [targetUrl, setTargetUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedType, setDetectedType] = useState<"blackbox" | "whitebox" | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState<number[]>([]);
  const [repoSearch, setRepoSearch] = useState("");
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [hasFetchedRepos, setHasFetchedRepos] = useState(false);
  const [githubAccount, setGithubAccount] = useState<{
    connected: boolean;
    username?: string;
    avatar?: string | null;
  }>({ connected: false });
  const [isCheckingGithub, setIsCheckingGithub] = useState(false);
  const [isConnectingGithub, setIsConnectingGithub] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [repoOptions, setRepoOptions] = useState<string[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");

  const assessments = useQuery(api.assessments.list, { projectId }) ?? [];
  const createAssessment = useMutation(api.assessments.create);
  const project = useQuery(api.projects.get, { projectId });
  const org = useQuery(
    api.organizations.get,
    project && "orgId" in project && project.orgId ? { orgId: project.orgId } : "skip"
  );
  const hasCredits = org && "credits" in org ? (org.credits ?? 0) > 0 : false;

  // Auto-detect assessment type based on URL
  const detectAssessmentType = (url: string): "blackbox" | "whitebox" | null => {
    if (!url.trim()) return null;

    const trimmedUrl = url.trim().toLowerCase();

    // Check for git repository patterns
    const gitPatterns = [
      /github\.com/i,
      /gitlab\.com/i,
      /bitbucket\.org/i,
      /\.git$/i,
      /^git@/i,
      /git\+https?:\/\//i,
    ];

    const isGitRepo = gitPatterns.some(pattern => pattern.test(trimmedUrl));

    if (isGitRepo) {
      return "whitebox";
    }

    // Check for HTTP/HTTPS URL (blackbox)
    try {
      const urlObj = new URL(trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`);
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return "blackbox";
      }
    } catch {
      // Not a valid URL yet
    }

    return null;
  };

  // Handle URL input change with auto-detection
  const handleUrlChange = (value: string) => {
    setTargetUrl(value);

    // Clear URL errors when user types
    if (errors.targetUrl) {
      setErrors({ ...errors, targetUrl: "" });
    }

    // Auto-detect type
    const detected = detectAssessmentType(value);
    setDetectedType(detected);

    // Auto-set type if detected
    if (detected) {
      setAssessmentType(detected);
    }
  };

  const refreshGithubStatus = useCallback(async (autoFetchRepos = false) => {
    // Only check GitHub status if user signed in with GitHub
    if (session?.user?.provider !== "github") {
      setGithubAccount({ connected: false });
      setRepoOptions([]);
      setSelectedRepo("");
      return;
    }

    setIsCheckingGithub(true);
    try {
      const response = await fetch("/api/auth/github/status");

      if (!response.ok) {
        throw new Error("Unable to check GitHub connection status.");
      }

      const data = await response.json();

      const isConnected = Boolean(data.connected);
      setGithubAccount({
        connected: isConnected,
        username: data.username,
        avatar: data.avatar,
      });

      if (typeof window !== "undefined") {
        if (isConnected) {
          try {
            const reposResponse = await fetch("/api/github/repos");
            if (reposResponse.ok) {
              const reposData = await reposResponse.json();
              if (reposData.repos && reposData.repos.length > 0) {
                setGithubRepos(reposData.repos);
                setHasFetchedRepos(true);
                const repoUrls = reposData.repos.map((repo: GitHubRepo) =>
                  `https://github.com/${repo.full_name}`
                );
                setRepoOptions(repoUrls);
                window.localStorage.setItem("githubRepoCache", JSON.stringify(repoUrls));
              } else {
                setRepoOptions([]);
                setGithubRepos([]);
                window.localStorage.removeItem("githubRepoCache");
              }
            } else {
              setRepoOptions([]);
              setGithubRepos([]);
              window.localStorage.removeItem("githubRepoCache");
            }
          } catch (repoError) {
            console.error("Failed to fetch repos:", repoError);
            setRepoOptions([]);
            setGithubRepos([]);
            window.localStorage.removeItem("githubRepoCache");
          }
        } else {
          window.localStorage.removeItem("githubRepoCache");
          setRepoOptions([]);
          setSelectedRepo("");
          setGithubRepos([]);
        }
      }
    } catch (error: any) {
      console.error("[Assessments] GitHub status check failed", error);
      setGithubError(error?.message || "Failed to check GitHub status.");
    } finally {
      setIsCheckingGithub(false);
    }
  }, [session?.user?.provider]);

  useEffect(() => {
    if (session?.user?.provider === "github") {
      refreshGithubStatus(true);
    }
  }, [refreshGithubStatus, session?.user?.provider]);

  // Check for GitHub connection success from URL params
  useEffect(() => {
    const githubAuthStatus = searchParams?.get("githubAuthStatus");
    const githubAuthError = searchParams?.get("githubAuthError");
    const githubAuthMessage = searchParams?.get("githubAuthMessage");

    if (githubAuthError) {
      showError(githubAuthError);
      const url = new URL(window.location.href);
      url.searchParams.delete("githubAuthError");
      router.replace(url.pathname + url.search);
    } else if (githubAuthStatus === "connected" || githubAuthStatus === "reauthorized") {
      showSuccess(githubAuthMessage || "GitHub connected successfully!");
      if (session?.user?.provider === "github") {
        refreshGithubStatus(true);
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("githubAuthStatus");
      url.searchParams.delete("githubAuthMessage");
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, session?.user?.provider, refreshGithubStatus, showSuccess, showError, router]);

  const handleConnectGithub = async () => {
    setGithubError(null);
    setIsConnectingGithub(true);
    try {
      const currentPath = window.location.pathname;
      const returnTo = currentPath || "/settings";
      window.location.href = `/api/auth/github/start?returnTo=${encodeURIComponent(returnTo)}`;
    } catch (error: any) {
      console.error("[Assessments] GitHub connect failed", error);
      setGithubError(error?.message || "GitHub authentication failed.");
      setIsConnectingGithub(false);
    }
  };

  const handleDisconnectGithub = async () => {
    setGithubError(null);
    try {
      const response = await fetch("/api/auth/github/disconnect", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect GitHub.");
      }

      setGithubAccount({ connected: false });
      setRepoOptions([]);
      setSelectedRepo("");
      setDetectedType(null);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("githubRepoCache");
      }

      if (assessmentType === "whitebox") {
        setTargetUrl("");
      }
    } catch (error: any) {
      console.error("[Assessments] GitHub disconnect failed", error);
      setGithubError(error?.message || "Unable to disconnect GitHub.");
    }
  };

  const handleRepoSelect = (value: string) => {
    setSelectedRepo(value);
    if (value) {
      setTargetUrl(value);
      setDetectedType("whitebox");
      setAssessmentType("whitebox");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!assessmentName.trim()) {
      newErrors.name = "Assessment name is required";
    }

    if (!targetUrl.trim()) {
      newErrors.targetUrl = "Target URL is required";
    } else {
      const detected = detectAssessmentType(targetUrl);

      if (!detected) {
        newErrors.targetUrl = "Invalid URL or Git repository";
      } else if (detected === "blackbox") {
        try {
          const url = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
          if (!url.protocol.match(/^https?:$/)) {
            newErrors.targetUrl = "Only HTTP/HTTPS URLs allowed";
          }
        } catch {
          newErrors.targetUrl = "Invalid URL";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isWhitebox = useMemo(
    () =>
      assessmentType === "whitebox" ||
      (assessmentType === "auto" && detectedType === "whitebox"),
    [assessmentType, detectedType]
  );

  useEffect(() => {
    if (!isWhitebox) {
      setSelectedRepoIds([]);
    }
  }, [isWhitebox]);

  const fetchGithubRepos = async () => {
    if (session?.user?.provider !== "github") {
      setRepoError("GitHub repository access is only available for users who signed in with GitHub.");
      return;
    }

    if (!githubAccount.connected) {
      setRepoError("Please connect your GitHub account first.");
      return;
    }

    setIsLoadingRepos(true);
    setRepoError(null);

    try {
      const response = await fetch("/api/github/repos");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to fetch GitHub repositories");
      }

      const data = await response.json();
      setGithubRepos(data.repos || []);
      setHasFetchedRepos(true);
    } catch (error: any) {
      console.error("Failed to fetch GitHub repos:", error);
      setRepoError(error.message || "Unable to fetch GitHub repositories");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  useEffect(() => {
    if (showCreateDialog && isWhitebox && !hasFetchedRepos && !isLoadingRepos && session?.user?.provider === "github" && githubAccount.connected) {
      fetchGithubRepos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateDialog, isWhitebox, hasFetchedRepos, isLoadingRepos, session?.user?.provider, githubAccount.connected]);

  const onSubmit = async () => {
    if (!validateForm()) {
      showError("Please check the form for errors");
      return;
    }

    if (!session?.user?.id) {
      showError("You need to be logged in");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalType = assessmentType === "auto" && detectedType ? detectedType : (assessmentType as "blackbox" | "whitebox");

      if (!finalType) {
        showError("Could not determine assessment type");
        return;
      }

      let normalizedUrl = targetUrl.trim();
      if (finalType === "blackbox" && !normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      const assessmentId = await createAssessment({
        projectId,
        name: assessmentName,
        description: assessmentDescription || undefined,
        type: finalType,
        targetType,
        targetUrl: finalType === "blackbox" ? normalizedUrl : undefined,
        gitRepoUrl: finalType === "whitebox" ? normalizedUrl : undefined,
        githubRepoIds: finalType === "whitebox" && selectedRepoIds.length > 0 ? selectedRepoIds : undefined,
        createdByUserId: session.user.id,
      });

      showSuccess("Assessment launched!");

      setAssessmentName("");
      setAssessmentDescription("");
      setTargetUrl("");
      setDetectedType(null);
      setAssessmentType("auto");
      setGithubRepos([]);
      setSelectedRepoIds([]);
      setRepoSearch("");
      setHasFetchedRepos(false);
      setRepoError(null);
      setErrors({});
      setShowCreateDialog(false);

      setTimeout(() => {
        router.push(`/assessments/${assessmentId}`);
      }, 500);
    } catch (error: any) {
      console.error("Assessment creation error:", error);
      showError(error?.message || "Failed to create assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "border-green-200 bg-green-500/10 text-green-700 dark:border-green-900 dark:text-green-400";
      case "running": return "border-blue-200 bg-blue-500/10 text-blue-700 dark:border-blue-900 dark:text-blue-400";
      case "failed": return "border-red-200 bg-red-500/10 text-red-700 dark:border-red-900 dark:text-red-400";
      default: return "border-slate-200 bg-slate-500/10 text-slate-700 dark:border-slate-800 dark:text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <ShieldCheck className="w-4 h-4" />;
      case "running": return <Activity className="w-4 h-4 animate-pulse" />;
      case "failed": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <>
      {ToastComponent}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold text-foreground">Assessments</h2>
          <div className="flex items-center gap-3">
            {org && "credits" in org && (
              <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50">
                Credits:{" "}
                <span className={`font-semibold ${(org.credits ?? 0) < 3 ? "text-amber-600" : "text-foreground"}`}>
                  {org.credits ?? 0}
                </span>
              </div>
            )}

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button disabled={!hasCredits} className="font-display">
                  <Plus className="w-4 h-4 mr-2" />
                  New Assessment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Security Assessment</DialogTitle>
                  <DialogDescription>
                    Configure and launch a new security scan for your application.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  {org && "credits" in org && (org.credits ?? 0) === 0 && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      No credits remaining. Please upgrade your plan.
                    </div>
                  )}

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Assessment Name <span className="text-red-500">*</span></label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="e.g. Q1 Security Scan"
                      value={assessmentName}
                      onChange={(e) => setAssessmentName(e.target.value)}
                    />
                    {errors.name && <p className="text-[0.8rem] text-destructive">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Assessment Type</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={assessmentType}
                        onChange={(e) => setAssessmentType(e.target.value as any)}
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="blackbox">Blackbox (Web)</option>
                        <option value="whitebox">Whitebox (Code)</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Target Type</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={targetType}
                        onChange={(e) => setTargetType(e.target.value)}
                      >
                        <option value="web_app">Web Application</option>
                        <option value="api">API</option>
                        <option value="mobile">Mobile App</option>
                        <option value="network">Network</option>
                      </select>
                    </div>
                  </div>

                  {session?.user?.provider === "github" && (
                    <div className="rounded-lg border border-border bg-secondary/10 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Github className="w-5 h-5" />
                          <span className="text-sm font-medium">GitHub Integration</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={githubAccount.connected ? handleDisconnectGithub : handleConnectGithub}
                          disabled={isConnectingGithub || isCheckingGithub}
                        >
                          {githubAccount.connected ? "Disconnect" : "Connect"}
                        </Button>
                      </div>

                      {githubAccount.connected && (
                        <div className="grid gap-2">
                          <label className="text-xs font-medium text-muted-foreground">Select Repository</label>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                            value={selectedRepo}
                            onChange={(e) => handleRepoSelect(e.target.value)}
                            disabled={isLoadingRepos}
                          >
                            <option value="">Select a repository...</option>
                            {githubRepos.map((repo) => (
                              <option key={repo.id} value={`https://github.com/${repo.full_name}`}>
                                {repo.full_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Target URL / Git Repo <span className="text-red-500">*</span></label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="https://example.com or https://github.com/user/repo"
                      value={targetUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                    />
                    {errors.targetUrl && <p className="text-[0.8rem] text-destructive">{errors.targetUrl}</p>}
                    {detectedType && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 p-2 rounded">
                        <Target className="w-3 h-3" />
                        Detected: <span className="font-semibold capitalize">{detectedType}</span>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={onSubmit} disabled={isSubmitting || (org && "credits" in org && (org.credits ?? 0) === 0)}>
                    {isSubmitting ? "Launching..." : "Start Assessment"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4">
          {assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No assessments yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Create your first assessment to start scanning for vulnerabilities.
              </p>
              <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                Create Assessment
              </Button>
            </div>
          ) : (
            assessments.map((assessment) => (
              <Link
                key={assessment._id}
                href={`/assessments/${assessment._id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                      {assessment.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(assessment.status)}`}>
                      <span className="mr-1">{getStatusIcon(assessment.status)}</span>
                      {assessment.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {assessment.type === "blackbox" ? <Globe className="w-3 h-3" /> : <Github className="w-3 h-3" />}
                      <span className="capitalize">{assessment.type}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      {assessment.targetType === "mobile" ? <Smartphone className="w-3 h-3" /> : <Server className="w-3 h-3" />}
                      <span className="capitalize">{assessment.targetType.replace('_', ' ')}</span>
                    </div>
                    {assessment.targetUrl && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1 truncate max-w-[200px]">
                          <Target className="w-3 h-3" />
                          <span className="truncate">{assessment.targetUrl}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-border/40 pt-4 sm:pt-0 sm:pl-4 pl-0">
                  <div className="flex flex-col items-end gap-1 min-w-[80px]">
                    <span className="text-xs text-muted-foreground">Findings</span>
                    <span className="text-lg font-bold">0</span>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 -mr-2 text-muted-foreground group-hover:text-primary">
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
