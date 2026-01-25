export default function Loading() {
  return (
    <div className="flex h-screen bg-background text-foreground pt-16 overflow-hidden">
      {/* Sidebar Skeleton */}
      <aside className="w-64 h-full shrink-0 border-r border-border/40 bg-card/40 flex flex-col">
        <div className="flex-1 p-4 space-y-6">
          <div className="h-9 w-32 rounded-lg bg-muted/40 animate-pulse" />
          <div className="space-y-3 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="h-5 w-5 rounded-full bg-muted/40" />
                <div className="h-4 w-24 rounded bg-muted/40" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-border/40">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="h-9 w-9 rounded-full bg-muted/50" />
            <div className="space-y-1.5">
              <div className="h-3 w-20 rounded bg-muted/50" />
              <div className="h-2 w-24 rounded bg-muted/40" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background/50">
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-10">
            <div className="mx-auto max-w-6xl space-y-8">

              {/* Header Skeleton */}
              <div className="flex justify-between items-end animate-pulse">
                <div className="space-y-3">
                  <div className="h-8 w-48 rounded-lg bg-muted/60" />
                  <div className="h-4 w-64 rounded bg-muted/40" />
                </div>
                <div className="h-6 w-32 rounded-full bg-muted/40" />
              </div>

              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl border border-border/60 bg-card/40 p-5 space-y-3 animate-pulse"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="h-3 w-24 rounded bg-muted/50" />
                    <div className="h-8 w-16 rounded bg-muted/60" />
                  </div>
                ))}
              </div>

              {/* Projects List Skeleton */}
              <div className="space-y-4">
                <div className="flex justify-between items-center animate-pulse">
                  <div className="h-6 w-32 rounded bg-muted/50" />
                  <div className="h-9 w-28 rounded-lg bg-muted/50" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-xl border border-border/60 bg-card/40 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

