import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function QRLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#07111F]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-7 w-24 bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-7 w-16 bg-slate-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6 space-y-2">
          <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-64 bg-slate-100 rounded animate-pulse" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center text-center max-w-sm mx-auto shadow-sm">
          <div className="h-2.5 w-28 bg-slate-100 rounded animate-pulse mb-3" />
          <div className="space-y-2 mb-6">
            <div className="h-5 w-44 bg-slate-100 rounded animate-pulse mx-auto" />
            <div className="h-5 w-36 bg-slate-100 rounded animate-pulse mx-auto" />
            <div className="h-5 w-40 bg-slate-100 rounded animate-pulse mx-auto" />
          </div>

          {/* QR placeholder */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-6">
            <div className="w-[180px] h-[180px] bg-slate-100 rounded animate-pulse" />
          </div>

          <div className="h-2.5 w-48 bg-slate-100 rounded animate-pulse mb-5" />

          <div className="pt-5 border-t border-slate-100 w-full flex justify-center">
            <div className="h-3 w-52 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  )
}
