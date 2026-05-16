'use client'

import { useActionState } from 'react'
import { MessageSquare, Loader2 } from 'lucide-react'
import { loginAction } from '../actions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null })

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#07111F] to-[#009B9A] flex items-center justify-center">
            <MessageSquare className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#07111F] to-[#009B9A] bg-clip-text text-transparent">
            TableTalk
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-lg font-semibold text-slate-900 mb-1">Dashboard access</h1>
          <p className="text-sm text-slate-400 mb-6">Enter the demo password to continue.</p>

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#009B9A] transition-colors bg-white"
              />
            </div>

            {state.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#07111F] hover:bg-[#0B1220] text-white py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</>
              ) : (
                'Enter Dashboard'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          TableTalk · Restaurant Operations
        </p>
      </div>
    </div>
  )
}
