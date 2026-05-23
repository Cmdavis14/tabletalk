'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, CheckCircle2, Loader2, EyeOff, User, Clock, Hash } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { DbGuestIssue } from '@/lib/db'
import { ISSUE_TYPE_LABELS, PRIORITY_LABELS, STATUS_LABELS, STATUS_TO_DB } from '@/lib/db'
import { priorityConfig, statusConfig, timeAgo } from '@/lib/ticket-utils'
import type { Priority, Status } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const STATUS_STEPS: Status[] = ['New', 'Seen', 'In Progress', 'Resolved']

export default function TicketDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [issue, setIssue] = useState<DbGuestIssue | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [currentStatus, setCurrentStatus] = useState<Status>('New')
  const [statusSaving, setStatusSaving] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  const [notes, setNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchIssue() {
      const { data, error } = await supabase
        .from('guest_issues')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setIssue(data)
        setCurrentStatus((STATUS_LABELS[data.status] ?? 'New') as Status)
        setNotes(data.internal_notes ?? '')
      }
      setLoading(false)
    }
    fetchIssue()
  }, [id])

  async function handleStatusChange(newStatus: Status) {
    if (!issue) return
    const previousStatus = currentStatus
    setCurrentStatus(newStatus)
    setStatusSaving(true)
    setStatusError(null)

    const dbStatus = STATUS_TO_DB[newStatus] ?? 'new'
    const updates: Record<string, unknown> = { status: dbStatus }
    if (newStatus === 'Resolved') updates.resolved_at = new Date().toISOString()

    const { error } = await supabase.from('guest_issues').update(updates).eq('id', issue.id)
    setStatusSaving(false)
    if (error) {
      setCurrentStatus(previousStatus)
      setStatusError('Failed to update status. Try again.')
    }
  }

  async function handleSaveNote() {
    if (!issue) return
    setNotesSaving(true)
    setNotesError(null)
    const { error } = await supabase.from('guest_issues').update({ internal_notes: notes }).eq('id', issue.id)
    setNotesSaving(false)
    if (error) {
      setNotesError('Failed to save note. Try again.')
    } else {
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      </div>
    )
  }

  if (notFound || !issue) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-slate-500 mb-3">Ticket not found.</p>
          <Link href="/dashboard" className="text-sm text-slate-900 underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const uiPriority = (PRIORITY_LABELS[issue.priority] ?? 'Medium') as Priority
  const pCfg = priorityConfig(uiPriority)
  const sCfg = statusConfig(currentStatus)
  const currentStepIndex = STATUS_STEPS.indexOf(currentStatus)
  const issueLabel = ISSUE_TYPE_LABELS[issue.issue_type] ?? issue.issue_type

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#07111F]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2 text-sm">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium truncate">{issueLabel}</span>
          {statusSaving && <Loader2 className="w-3 h-3 text-slate-400 animate-spin ml-auto" />}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-5">
        {/* Ticket info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{issueLabel}</h1>
              <p className="text-sm text-slate-400 mt-0.5">Table {issue.table_number ?? '—'}</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <span className={cn('text-xs px-2.5 py-1 rounded-full border font-semibold', pCfg.className)}>
                {pCfg.label}
              </span>
              <span className={cn('text-xs px-2.5 py-1 rounded-full border font-semibold', sCfg.className)}>
                {sCfg.label}
              </span>
            </div>
          </div>

          {/* Guest message */}
          <div className="bg-slate-50 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">Guest message</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              &ldquo;{issue.message ?? 'No message provided.'}&rdquo;
            </p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Guest status
              </p>
              <p className="font-medium text-slate-800 flex items-center gap-1.5">
                {issue.is_guest_still_here && <span className="w-2 h-2 bg-[#009B9A] rounded-full" />}
                {issue.is_guest_still_here ? 'Still here' : 'Already left'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Submitted
              </p>
              <p className="font-medium text-slate-800">{timeAgo(issue.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3" /> Order ref
              </p>
              <p className="font-medium text-slate-800">{issue.order_identifier ?? '—'}</p>
            </div>
          </div>

          {/* Contact info if provided */}
          {(issue.customer_name || issue.customer_email) && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
              {issue.customer_name && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Guest name</p>
                  <p className="font-medium text-slate-800">{issue.customer_name}</p>
                </div>
              )}
              {issue.customer_email && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Email</p>
                  <p className="font-medium text-slate-800">{issue.customer_email}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-1">Update Status</h2>
          <p className="text-xs text-slate-400 mb-4">Move the issue forward as your team handles it.</p>
          <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
            {STATUS_STEPS.flatMap((s, idx) => {
              const btn = (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={statusSaving}
                  className={cn(
                    'shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-60 disabled:cursor-not-allowed',
                    currentStatus === s
                      ? 'bg-[#009B9A] text-white border-[#009B9A] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                  )}
                >
                  {s}
                </button>
              )
              return idx === 0
                ? [btn]
                : [<span key={`sep-${idx}`} className="shrink-0 text-slate-300 select-none text-sm">›</span>, btn]
            })}
          </div>
          {statusError && (
            <p className="mt-3 text-sm text-red-500">{statusError}</p>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-5">Timeline</h2>
          <div className="relative">
            <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-100" />
            <div className="space-y-5 relative">
              {STATUS_STEPS.map((step, idx) => {
                const isPast = idx < currentStepIndex
                const isCurrent = step === currentStatus
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 bg-white',
                      isCurrent ? 'border-[#009B9A] bg-[#009B9A]' : isPast ? 'border-slate-300 bg-slate-300' : 'border-slate-200'
                    )}>
                      {(isCurrent || isPast) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-sm font-medium',
                        isCurrent ? 'text-slate-900' : isPast ? 'text-slate-400' : 'text-slate-300'
                      )}>
                        {step}
                      </span>
                      {isCurrent && (
                        <span className="text-xs bg-[#009B9A] text-white px-2 py-0.5 rounded-full">Current</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Internal notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Internal Notes</h2>
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4">
            <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Visible to your team only — never shared with the guest.
            </p>
          </div>
          <textarea
            rows={3}
            placeholder="Add notes for the team (e.g. comped dessert, spoke with manager)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#009B9A] transition-colors resize-none bg-slate-50"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleSaveNote}
              disabled={notesSaving || notes === (issue?.internal_notes ?? '')}
              className="text-sm bg-[#07111F] hover:bg-[#0B1220] text-white px-4 py-3 rounded-xl transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {notesSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save note'}
            </button>
            {notesSaved && (
              <span className="text-xs text-[#009B9A] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
          {notesError && (
            <p className="mt-2 text-sm text-red-500">{notesError}</p>
          )}
        </div>
      </main>
    </div>
  )
}
