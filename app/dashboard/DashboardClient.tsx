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
  const resolvedToday = tickets.filter((t) => t.status === 'Resolved')
  const stillHereOpen = tickets.filter(
    (t) => t.guestStatus === 'Still here' && t.status !== 'Resolved' && t.status !== 'Closed'
  )

  const typeCounts = tickets.reduce<Record<string, number>>((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1
    return acc
  }, {})
  const topType =
    Object.keys(typeCounts).length > 0
      ? Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]
      : '—'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 leading-none group-hover:text-gray-700 transition-colors">
                {restaurantName}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {restaurantLocation ? `${restaurantLocation} · ` : ''}Guest Issue Desk
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/qr"
              className="text-sm text-gray-500 hover:text-black border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              QR Code
            </Link>
            <Link
              href={`/r/${restaurantSlug}`}
              className="hidden sm:inline-flex text-sm text-gray-500 hover:text-black border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              Guest form ↗
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-black transition-colors"
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
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3 uppercase tracking-wide font-medium">
              <MessageSquare className="w-3.5 h-3.5" /> Open Issues
            </div>
            <p className="text-3xl font-bold text-gray-900">{openTickets.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              {newTickets.length > 0 ? `${newTickets.length} new · awaiting response` : 'None new'}
            </p>
          </div>

          <div className={cn(
            'rounded-2xl border p-5 transition-colors',
            criticalTickets.length > 0
              ? 'bg-red-50 border-red-100'
              : 'bg-white border-gray-200'
          )}>
            <div className="flex items-center gap-1.5 text-red-400 text-xs mb-3 uppercase tracking-wide font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Critical
            </div>
            <p className="text-3xl font-bold text-red-600">{criticalTickets.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              {criticalTickets.length > 0 ? 'Needs immediate attention' : 'All clear'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-1.5 text-emerald-500 text-xs mb-3 uppercase tracking-wide font-medium">
              <Users className="w-3.5 h-3.5" /> Guests Here
            </div>
            <p className="text-3xl font-bold text-gray-900">{stillHereOpen.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stillHereOpen.length > 0 ? 'With open issues · act now' : 'No open issues on-site'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-1.5 text-green-500 text-xs mb-3 uppercase tracking-wide font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
            </div>
            <p className="text-3xl font-bold text-gray-900">{resolvedToday.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              {topType !== '—' ? `Top issue: ${topType}` : 'No resolved issues yet'}
            </p>
          </div>
        </div>

        {/* Ticket list */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Guest Issues</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {tickets.length} total
            </span>
          </div>

          {tickets.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">No guest issues yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                When guests submit issues they will appear here in real time.
              </p>
              <Link
                href={`/r/${restaurantSlug}`}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black border border-gray-200 hover:border-gray-400 px-3 py-2 rounded-lg transition-colors"
              >
                Open guest form to test ↗
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tickets.map((ticket) => {
                const pCfg = priorityConfig(ticket.priority)
                const sCfg = statusConfig(ticket.status)
                return (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/tickets/${ticket.id}`}
                    className={cn(
                      'flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group border-l-2',
                      ticket.priority === 'Critical' ? 'border-l-red-400' : 'border-l-transparent'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-gray-900 text-sm">{ticket.type}</span>
                        {ticket.guestStatus === 'Still here' && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
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
                      <p className="text-sm text-gray-500 truncate">{ticket.message}</p>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="text-xs font-medium text-gray-600">Table {ticket.table}</p>
                      <p className="text-xs text-gray-400">{timeAgo(ticket.createdAt)}</p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
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
