import Link from 'next/link'
import { MessageSquare, AlertTriangle, Clock, CheckCircle2, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { dbToTicket } from '@/lib/db'
import { priorityConfig, statusConfig, timeAgo } from '@/lib/ticket-utils'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Fetch restaurant
  const { data: restaurant, error: rError } = await supabase
    .from('restaurants')
    .select('id, name, location')
    .eq('slug', 'sol-smoke-kitchen')
    .single()

  if (rError || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Could not load restaurant data.</p>
          <p className="text-xs text-gray-400">{rError?.message}</p>
        </div>
      </div>
    )
  }

  // Fetch guest issues
  const { data: issues, error: iError } = await supabase
    .from('guest_issues')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('created_at', { ascending: false })

  if (iError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Could not load guest issues.</p>
          <p className="text-xs text-gray-400">{iError.message}</p>
        </div>
      </div>
    )
  }

  const tickets = (issues ?? []).map(dbToTicket)
  const openTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed')
  const criticalTickets = tickets.filter(t => t.priority === 'Critical')
  const resolvedToday = tickets.filter(t => t.status === 'Resolved')
  const stillHereOpen = tickets.filter(t => t.guestStatus === 'Still here' && t.status !== 'Resolved' && t.status !== 'Closed')

  const typeCounts = tickets.reduce<Record<string, number>>((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1
    return acc
  }, {})
  const topType = Object.keys(typeCounts).length > 0
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
              <p className="font-semibold text-gray-900 leading-none group-hover:text-gray-700 transition-colors">{restaurant.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {restaurant.location ? `${restaurant.location} · ` : ''}Guest Issue Desk
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
              href="/r/sol-smoke-kitchen"
              className="hidden sm:inline-flex text-sm text-gray-500 hover:text-black border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              Guest form ↗
            </Link>
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
            <p className="text-xs text-gray-400 mt-1">{stillHereOpen.length} guests still here</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-1.5 text-red-400 text-xs mb-3 uppercase tracking-wide font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Critical
            </div>
            <p className="text-3xl font-bold text-red-600">{criticalTickets.length}</p>
            <p className="text-xs text-gray-400 mt-1">Needs immediate attention</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3 uppercase tracking-wide font-medium">
              <Clock className="w-3.5 h-3.5" /> Avg Response
            </div>
            <p className="text-3xl font-bold text-gray-900">—</p>
            <p className="text-xs text-gray-400 mt-1">Not enough data yet</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-1.5 text-green-500 text-xs mb-3 uppercase tracking-wide font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved Today
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
            <h2 className="font-semibold text-gray-900">Recent Guest Issues</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {tickets.length} total
            </span>
          </div>

          {tickets.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <CheckCircle2 className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-400">No guest issues yet</p>
              <p className="text-xs text-gray-300 mt-1">Issues submitted via the guest form will appear here.</p>
              <Link
                href="/r/sol-smoke-kitchen"
                className="inline-block mt-4 text-xs text-gray-500 hover:text-black underline underline-offset-2 transition-colors"
              >
                Open guest form to test
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
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', pCfg.className)}>
                          {pCfg.label}
                        </span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', sCfg.className)}>
                          {sCfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{ticket.message}</p>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="text-xs font-medium text-gray-600">Table {ticket.table}</p>
                      <p className="text-xs text-gray-400">{timeAgo(ticket.createdAt)}</p>
                      {ticket.guestStatus === 'Still here' && (
                        <div className="flex items-center justify-end gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          <span className="text-xs text-green-600">Here</span>
                        </div>
                      )}
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
