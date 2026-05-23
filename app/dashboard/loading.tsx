import { MessageSquare } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#07111F]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#009B9A] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-36 bg-slate-700 rounded animate-pulse" />
              <div className="h-2.5 w-24 bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-20 bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-7 w-24 bg-slate-800 rounded-lg animate-pulse hidden sm:block" />
            <div className="h-7 w-16 bg-slate-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse mb-4" />
              <div className="h-8 w-10 bg-slate-100 rounded animate-pulse mb-2" />
              <div className="h-2.5 w-28 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Ticket list */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="h-3.5 w-24 bg-slate-100 rounded animate-pulse" />
            <div className="h-5 w-14 bg-slate-100 rounded-full animate-pulse" />
          </div>
          <div className="divide-y divide-slate-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-28 bg-slate-100 rounded animate-pulse" />
                    <div className="h-4 w-14 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-4 w-14 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                  <div className="h-3 w-64 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="text-right space-y-1.5 shrink-0">
                  <div className="h-3 w-14 bg-slate-100 rounded animate-pulse ml-auto" />
                  <div className="h-3 w-10 bg-slate-100 rounded animate-pulse ml-auto" />
                </div>
                <div className="w-4 h-4 bg-slate-100 rounded animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
