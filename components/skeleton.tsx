interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function SkeletonText({ className = "", lines = 1 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded h-4 ${
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = "w-10 h-10" }: { size?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-full ${size}`} />;
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}>
      <div className="space-y-3">
        <div className="animate-pulse bg-gray-200 rounded h-3 w-24" />
        <div className="animate-pulse bg-gray-200 rounded h-8 w-32" />
        <div className="animate-pulse bg-gray-200 rounded-full h-5 w-20" />
      </div>
    </div>
  );
}

export function SkeletonKPIRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="px-6 py-4 bg-gray-50/80">
        <div className="flex gap-6">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded h-3 w-20" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 border-t border-gray-100">
          <div className="flex gap-6 items-center">
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className={`animate-pulse bg-gray-100 rounded h-4 ${
                  j === 0 ? "w-8" : j === 1 ? "w-32" : "w-20"
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = "h-[300px]" }: { height?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]`}>
      <div className="animate-pulse bg-gray-200 rounded h-5 w-40 mb-4" />
      <div className={`animate-pulse bg-gray-100 rounded-xl ${height}`} />
    </div>
  );
}
