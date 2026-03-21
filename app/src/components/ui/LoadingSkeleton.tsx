interface LoadingSkeletonProps {
  type?: "card" | "list" | "stat" | "form" | "detail";
  count?: number;
}

export function LoadingSkeleton({ type = "card", count = 3 }: LoadingSkeletonProps) {
  if (type === "stat") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="stat-card h-28">
            <div className="skeleton w-full h-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="glass-card p-6 h-32">
            <div className="skeleton w-full h-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className="glass-card p-8 space-y-6 max-w-2xl mx-auto">
        <div className="skeleton h-12 w-1/3 rounded-lg" />
        <div className="skeleton h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-14 w-full rounded-xl" />
          <div className="skeleton h-14 w-full rounded-xl" />
        </div>
        <div className="skeleton h-14 w-full rounded-xl" />
      </div>
    );
  }

  if (type === "detail") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="skeleton h-12 w-32 rounded-lg" />
        <div className="glass-card p-8 h-96">
          <div className="skeleton w-full h-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-6 h-48">
          <div className="skeleton w-full h-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
