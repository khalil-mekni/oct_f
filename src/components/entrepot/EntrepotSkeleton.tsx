export const EntrepotSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
      <div className="h-5 w-56 animate-pulse rounded bg-slate-200" />
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200">
            <th className="px-4 py-4">
              <div className="h-4 w-8 animate-pulse rounded bg-slate-200" />
            </th>
            <th className="px-4 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            </th>
            <th className="px-4 py-4">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            </th>
            <th className="px-4 py-4">
              <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" />
            </th>
            <th className="px-4 py-4">
              <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" />
            </th>
            <th className="px-4 py-4">
              <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" />
            </th>
            <th className="px-4 py-4">
              <div className="mx-auto h-4 w-14 animate-pulse rounded bg-slate-200" />
            </th>
            <th className="px-4 py-4">
              <div className="mx-auto h-4 w-16 animate-pulse rounded bg-slate-200" />
            </th>
            <th className="px-4 py-4">
              <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" />
            </th>
          </tr>
        </thead>

        <tbody>
          {[...Array(6)].map((_, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="px-4 py-4">
                <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="space-y-2">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                </div>
              </td>

              <td className="px-4 py-4">
                <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="mx-auto h-6 w-12 animate-pulse rounded-full bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="mx-auto h-6 w-20 animate-pulse rounded-full bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="ml-auto h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);