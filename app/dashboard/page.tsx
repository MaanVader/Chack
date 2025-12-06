// app/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { checkOnboarding } from "@/app/actions/onboarding";
import DashboardContent from "@/components/dashboard-content";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Check if user is onboarded
  const onboarded = await checkOnboarding(session.user.id);
  if (!onboarded) {
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-slate-400">
          Welcome back! Manage your security assessments.
        </p>
      </div>

      <DashboardContent userId={session.user.id} />
    </main>
  );
}

