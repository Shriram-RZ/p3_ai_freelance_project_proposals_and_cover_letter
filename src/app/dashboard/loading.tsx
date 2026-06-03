/**
 * Route-segment fallback shown while a dashboard server page streams in.
 * Mirrors the common header + stat grid + list layout so the transition
 * feels instant instead of a frozen screen.
 */
export default function DashboardLoading() {
  return (
    <div className="px-6 lg:px-8 py-8 animate-pulse">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div className="space-y-3">
          <div className="h-7 w-56 rounded-lg bg-white/10 shimmer" />
          <div className="h-4 w-72 rounded bg-white/5 shimmer" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-white/10 shimmer" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-5 space-y-4">
            <div className="h-4 w-24 rounded bg-white/10 shimmer" />
            <div className="h-8 w-16 rounded-lg bg-white/10 shimmer" />
            <div className="h-3 w-20 rounded bg-white/5 shimmer" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="h-5 w-40 rounded bg-white/10 shimmer" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="h-9 w-9 rounded-lg bg-white/10 shimmer shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-white/10 shimmer" />
                <div className="h-3 w-1/3 rounded bg-white/5 shimmer" />
              </div>
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="h-5 w-32 rounded bg-white/10 shimmer" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-white/5 shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
