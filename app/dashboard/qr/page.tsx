import { supabase } from '@/lib/supabase'
import QRClient from './QRClient'

const DEMO_SLUG = process.env.NEXT_PUBLIC_DEMO_RESTAURANT_SLUG || 'sol-smoke-kitchen'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export default async function QRPage() {
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name')
    .eq('slug', DEMO_SLUG)
    .single()

  const restaurantName = restaurant?.name ?? DEMO_SLUG
  const guestUrl = `${APP_URL}/r/${DEMO_SLUG}`

  return <QRClient restaurantName={restaurantName} guestUrl={guestUrl} />
}
