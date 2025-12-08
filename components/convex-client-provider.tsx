// components/convex-client-provider.tsx

"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo } from "react";

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  // Always call hooks unconditionally - before any early returns
  const convex = useMemo(() => {
    if (!convexUrl) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not set");
      // Return a dummy client if URL is not set (will fail gracefully)
      return new ConvexReactClient("https://placeholder.convex.cloud");
    }
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  if (!convexUrl) {
    console.error("NEXT_PUBLIC_CONVEX_URL is not set");
    return <>{children}</>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

