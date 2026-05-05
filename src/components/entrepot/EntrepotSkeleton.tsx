"use client";

export const EntrepotSkeleton = () => (
  <div className="space-y-0">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="grid animate-pulse grid-cols-9 items-center gap-2 border-b border-gray-50 px-6 py-5 last:border-b-0"
        style={{ animationDelay: `${i * 80}ms` }}
      >
        {/* Expand button */}
        <div className="flex justify-start">
          <div className="h-8 w-8 rounded-xl bg-gray-100" />
        </div>

        {/* Nom */}
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded-lg bg-gray-200" />
          <div className="h-3 w-16 rounded-lg bg-gray-100" />
        </div>

        {/* Adresse */}
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 shrink-0 rounded-full bg-gray-100" />
          <div className="h-4 w-40 rounded-lg bg-gray-100" />
        </div>

        {/* Capacité */}
        <div className="flex justify-end">
          <div className="h-4 w-16 rounded-lg bg-gray-200" />
        </div>

        {/* Stock */}
        <div className="flex justify-end">
          <div className="h-4 w-14 rounded-lg bg-gray-100" />
        </div>

        {/* Barre occupation */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 w-16 rounded bg-gray-100" />
            <div className="h-3 w-8 rounded bg-gray-100" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gray-200"
              style={{ width: `${20 + i * 15}%` }}
            />
          </div>
        </div>

        {/* Lots badge */}
        <div className="flex justify-center">
          <div className="h-6 w-14 rounded-full bg-gray-100" />
        </div>

        {/* Statut badge */}
        <div className="flex justify-center">
          <div className="h-6 w-16 rounded-full bg-gray-100" />
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          <div className="h-8 w-24 rounded-xl bg-gray-100" />
        </div>
      </div>
    ))}
  </div>
);