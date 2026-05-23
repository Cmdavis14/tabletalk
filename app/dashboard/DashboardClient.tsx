'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, AlertTriangle, Users, CheckCircle2, ChevronRight, LogOut, Inbox } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { dbToTicket } from '@/lib/db'
import type { DbGuestIssue } from '@/lib/db'
import { priorityConfig, statusConfig, timeAgo } from '@/lib/ticket-utils'
import type { Ticket } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { logoutAction } from './actions'

interface Props {
  restaurantId: string
  restaurantName: string
  restaurantLocation: string | null
  restaurantSlug: string
  initialTickets: Ticket[]
}

export default function DashboardClient({ restaurantId, restaurantName, restaurantLocation, restaurantSlug, initialTickets }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [, setTick] = useState(0)
  const [activeFilter, setActiveFilter] = useState<'All' | 'New' | 'In Progress' | 'Resolved' | 'Critical'>('All')

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('guest-issues-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guest_issues',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTickets((prev) => [dbToTicket(payload.new as DbGuestIssue), ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTickets((prev) =>
              prev.map((t) =>
                t.id === (payload.new as DbGuestIssue).id
                  ? dbToTicket(payload.new as DbGuestIssue)
                  : t
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setTickets((prev) => prev.filter((t) => t.id !== (payload.old as { id: string }).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantId])

  const openTickets = tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed')
  const newTickets = tickets.filter((t) => t.status === 'New')
  const criticalTickets = tickets.filter((t) => t.priority === 'Critical')
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const resolvedToday = tickets.filter(
    (t) => t.status === 'Resolved' && t.resolvedAt != null && new Date(t.resolvedAt) >= todayStart
  )
  const stillHereOpen = tickets.filter(
    (t) => t.guestStatus === 'Still here' && t.status !== 'Resolved' && t.status !== 'Closed'
  )

  const filteredTickets = activeFilter === 'All'
    ? tickets
    : activeFilter === 'Critical'
      ? tickets.filter((t) => t.priority === 'Critical')
      : tickets.filter((t) => t.status === activeFilter)

  const resolvedTypeCounts = resolvedToday.reduce<Record<string, number>>((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1
    return acc
  }, {})
  const topResolvedType =
    Object.keys(resolvedTypeCounts).length > 0
      ? Object.entries(resolvedTypeCounts).sort((a, b) => b[1] - a[1])[0][0]
      : '—'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#07111F]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-[#009B9A] flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white leading-none group-hover:text-slate-200 transition-colors">
                {restaurantName}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {restaurantLocation ? `${restaurantLocation} · ` : ''}Guest Issue Desk
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/qr"
              className="text-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              QR Code
            </Link>
            <Link
              href={`/r/${restaurantSlug}`}
              className="hidden sm:inline-flex text-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              Guest form ↗
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-3 uppercase tracking-wide font-medium">
              <MessageSquare className="w-3.5 h-3.5" /> Open Issues
            </div>
            <p className="text-3xl font-bold text-slate-900">{openTickets.length}</p>
            <p className="text-xs text-slate-400 mt-1">
              {newTickets.length > 0 ? `${newTickets.length} new · awaiting response` : 'None new'}
            </p>
          </div>

          <div className={cn(
            'rounded-2xl border p-5 transition-colors',
            criticalTickets.length > 0
              ? 'bg-red-50 border-red-100'
              : 'bg-white border-slate-200'
          )}>
            <div className="flex items-center gap-1.5 text-red-400 text-xs mb-3 uppercase tracking-wide font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Critical
            </div>
            <p className="text-3xl font-bold text-red-600">{criticalTickets.length}</p>
            <p className="text-xs text-slate-400 mt-1">
              {criticalTickets.length > 0 ? 'Needs immediate attention' : 'All clear'}
            </p>
          </div>

          <div className="bg-[#DDFBFA] rounded-2xl border border-[#9EECEB] p-5">
            <div className="flex items-center gap-1.5 text-[#009B9A] text-xs mb-3 uppercase tracking-wide font-medium">
              <Users className="w-3.5 h-3.5" /> Guests Here
            </div>
            <p className="text-3xl font-bold text-slate-900">{stillHereOpen.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              {stillHereOpen.length > 0 ? 'With open issues · act now' : 'No open issues on-site'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-1.5 text-green-500 text-xs mb-3 uppercase tracking-wide font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
            </div>
            <p className="text-3xl font-bold text-slate-900">{resolvedToday.length}</p>
            <p className="text-xs text-slate-400 mt-1">
              {topResolvedType !== '—' ? `Most resolved: ${topResolvedType}` : 'No resolved issues yet'}
            </p>
          </div>
        </div>

        {/* Ticket list */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 pt-4 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900">Guest Issues</h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {activeFilter === 'All'
                  ? `${tickets.length} total`
                  : `${filteredTickets.length} of ${tickets.length}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1">
              {(['All', 'New', 'In Progress', 'Resolved', 'Critical'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    activeFilter === f
                      ? f === 'Critical'
                        ? 'bg-red-500 text-white'
                        : 'bg-[#07111F] text-white'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {tickets.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">No guest issues yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                When guests submit issues they will appear here in real time.
              </p>
              <Link
                href={`/r/${restaurantSlug}`}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400 px-3 py-2 rounded-lg transition-colors"
              >
                Open guest form to test ↗
              </Link>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-500">No {activeFilter.toLowerCase()} issues</p>
              <button
                onClick={() => setActiveFilter('All')}
                className="text-xs text-[#009B9A] hover:underline mt-2 block mx-auto"
              >
                View all issues
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => {
                const pCfg = priorityConfig(ticket.priority)
                const sCfg = statusConfig(ticket.status)
                return (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/tickets/${ticket.id}`}
                    className={cn(
                      'flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group border-l-2',
                      ticket.priority === 'Critical' ? 'border-l-red-400' : 'border-l-transparent'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-slate-900 text-sm">{ticket.type}</span>
                        {ticket.guestStatus === 'Still here' && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-[#DDFBFA] text-[#009B9A] border border-[#9EECEB] px-1.5 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 bg-[#009B9A] rounded-full" />
                            Still here
                          </span>
                        )}
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', pCfg.className)}>
                          {pCfg.label}
                        </span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', sCfg.className)}>
                          {sCfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{ticket.message}</p>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="text-xs font-medium text-slate-600">Table {ticket.table}</p>
                      <p className="text-xs text-slate-400">{timeAgo(ticket.createdAt)}</p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
