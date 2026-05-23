'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { MessageSquare, AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[TableTalk] Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#07111F]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#009B9A] flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <p className="font-semibold text-white leading-none">TableTalk</p>
        </div>
      </header>

      <main className="flex items-center justify-center px-6 py-24">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 mb-2">Dashboard error</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-7">
            Something went wrong loading this page. Retrying usually fixes it.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 w-full bg-[#009B9A] hover:bg-[#008786] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try again
            </button>
            <Link
              href="/dashboard"
              className="text-sm text-slate-400 hover:text-slate-700 transition-colors underline underline-offset-2"
            >
              ← Back to dashboard
            </Link>
          </div>
          {error.digest && (
            <p className="mt-6 text-[11px] text-slate-300 font-mono">ref: {error.digest}</p>
          )}
        </div>
      </main>
    </div>
  )
}
