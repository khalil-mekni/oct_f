export const EntrepotSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-40 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200">
            {[...Array(9)].map((_, i) => (
              <th key={i} className="px-4 py-4">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b border-slate-100">
              {[...Array(9)].map((_, j) => (
                <td key={j} className="px-4 py-4">
                  <div className={`h-5 animate-pulse rounded bg-slate-200 ${
                    j === 0 ? "w-8" : 
                    j === 1 ? "w-32" :
                    j === 2 ? "w-48" :
                    j === 8 ? "w-24" : "w-16"
                  }`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);