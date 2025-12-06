"use client";

export default function HomeLoading() {
  return (
    <main className="bg-background px-4 py-12 text-foreground min-h-screen">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 via-cyan-50/30 to-transparent dark:from-sky-950/20 dark:via-cyan-950/10" />
        <div className="absolute -top-1/2 -left-1/2 h-full w-full animate-gradient-xy rounded-full bg-gradient-to-r from-sky-400/20 via-cyan-400/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full animate-gradient-xy-delayed rounded-full bg-gradient-to-r from-cyan-400/20 via-sky-400/20 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center gap-8 text-center">
        {/* Animated logo/brand area */}
        <div className="space-y-5">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 ring-1 ring-primary/20">
            <div className="h-3 w-3 rounded-full bg-primary animate-pulse-slow mr-2" />
            <div className="h-2 w-24 bg-primary/20 rounded-full animate-shimmer" />
          </div>
          
          {/* Animated title skeleton */}
          <div className="space-y-3">
            <div className="h-12 w-full max-w-2xl mx-auto bg-gradient-to-r from-foreground/10 via-foreground/20 to-foreground/10 rounded-lg animate-shimmer" />
            <div className="h-12 w-full max-w-xl mx-auto bg-gradient-to-r from-foreground/10 via-foreground/20 to-foreground/10 rounded-lg animate-shimmer-delayed" />
          </div>
          
          {/* Animated description skeleton */}
          <div className="space-y-2">
            <div className="h-6 w-full max-w-3xl mx-auto bg-muted/50 rounded animate-pulse" />
            <div className="h-6 w-full max-w-2xl mx-auto bg-muted/50 rounded animate-pulse-delayed" />
          </div>
        </div>

        {/* Animated feature cards skeleton */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card/50 px-4 py-3 shadow-sm animate-card-load"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="h-4 w-full bg-muted/50 rounded mb-2 animate-pulse" />
              <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Animated CTA buttons skeleton */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <div className="h-12 w-48 bg-gradient-to-r from-sky-500/50 to-cyan-500/50 rounded-xl animate-pulse-glow" />
          <div className="h-12 w-32 bg-muted/50 rounded animate-pulse" />
        </div>

        {/* Floating animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/10 animate-float"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
                width: `${8 + (i % 3) * 4}px`,
                height: `${8 + (i % 3) * 4}px`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + (i % 2)}s`,
              }}
            />
          ))}
        </div>
      </div>

        {/* Animated "How it works" section skeleton */}
        <div className="mx-auto mt-10 max-w-5xl space-y-6 rounded-2xl border border-border bg-card/50 px-6 py-8 shadow-sm animate-fade-in-delayed">
          <div className="space-y-3 text-center">
            <div className="h-4 w-32 bg-primary/20 rounded mx-auto animate-pulse" />
            <div className="h-8 w-96 max-w-full bg-foreground/10 rounded mx-auto animate-shimmer" />
            <div className="h-6 w-full max-w-2xl bg-muted/50 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card/50 px-4 py-5 shadow-sm animate-card-load"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="h-3 w-16 bg-primary/20 rounded mb-3 animate-pulse" />
                <div className="h-6 w-full bg-foreground/10 rounded mb-2 animate-shimmer" />
                <div className="h-4 w-full bg-muted/50 rounded mb-1 animate-pulse" />
                <div className="h-4 w-5/6 bg-muted/30 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
    </main>
  );
}

