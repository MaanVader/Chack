// components/onboarding-form.tsx

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useToast } from "./toast";

export default function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { success: showSuccess, error: showError, ToastComponent } = useToast();
  const [orgName, setOrgName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrg = useMutation(api.onboarding.createOrganization);
  const joinOrg = useMutation(api.onboarding.joinOrganization);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!orgName.trim()) {
      newErrors.orgName = "🏢 Your organization needs a name!";
    } else if (orgName.length < 2) {
      newErrors.orgName = "📐 Too short! At least 2 characters please.";
    } else if (orgName.length > 100) {
      newErrors.orgName = "📚 Keep it under 100 characters, shall we?";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      showError("🚨 Hold on! Fix the errors below.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Starting organization creation...", { orgName, userId });
      const orgId = await createOrg({ name: orgName, userId });
      console.log("Organization created:", orgId);

      console.log("Joining organization...");
      await joinOrg({ orgId, userId, role: "owner" });
      console.log("Joined organization successfully");

      showSuccess("🎉 Welcome aboard! Your organization is ready.");

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error: any) {
      console.error("Onboarding flow failed:", error);

      let errorMessage = "💥 Something went wrong!";
      if (error?.message?.includes("exists")) {
        errorMessage = "🔄 Organization already exists. Try a different name?";
      } else if (error?.message) {
        errorMessage = `😅 ${error.message}`;
      }

      showError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {ToastComponent}
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 font-semibold font-display">Create your own organization</h2>
          <input
            value={orgName}
            onChange={(e) => {
              setOrgName(e.target.value);
              if (errors.orgName) setErrors({ ...errors, orgName: "" });
            }}
            placeholder="Acme Security"
            className={`w-full rounded border ${errors.orgName ? 'border-red-500 focus:ring-red-400' : 'border-slate-700'} bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all duration-300`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSubmitting) {
                handleCreate();
              }
            }}
          />
          {errors.orgName && (
            <p className="text-xs text-red-400 mt-1 font-display animate-slide-in-down">{errors.orgName}</p>
          )}
          <button
            disabled={isSubmitting}
            onClick={handleCreate}
            className="mt-3 w-full rounded bg-sky-500 px-3 py-2 font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 font-display"
          >
            {isSubmitting ? "🚀 Setting up..." : "Create & Continue"}
          </button>
        </div>
      </div>
    </>
  );
}

