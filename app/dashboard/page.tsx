import { supabase } from '@/lib/supabase'
import { dbToTicket } from '@/lib/db'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

const DEMO_SLUG = process.env.NEXT_PUBLIC_DEMO_RESTAURANT_SLUG || 'sol-smoke-kitchen'

export default async function DashboardPage() {
  const { data: restaurant, error: rError } = await supabase
    .from('restaurants')
    .select('id, name, location')
    .eq('slug', DEMO_SLUG)
    .single()

  if (rError || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-slate-500 mb-2">Could not load restaurant data.</p>
          <p className="text-xs text-slate-400">{rError?.message}</p>
        </div>
      </div>
    )
  }

  const { data: issues, error: iError } = await supabase
    .from('guest_issues')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('created_at', { ascending: false })

  if (iError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-slate-500 mb-2">Could not load guest issues.</p>
          <p className="text-xs text-slate-400">{iError.message}</p>
        </div>
      </div>
    )
  }

  const initialTickets = (issues ?? []).map(dbToTicket)

  return (
    <DashboardClient
      restaurantId={restaurant.id}
      restaurantName={restaurant.name}
      restaurantLocation={restaurant.location}
      restaurantSlug={DEMO_SLUG}
      initialTickets={initialTickets}
    />
  )
}
