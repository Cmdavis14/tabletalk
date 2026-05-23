import { NextResponse } from 'next/server'
import { sendGuestIssueEmail, type NotifyPayload } from '@/lib/notify'

export async function POST(request: Request) {
  const token = request.headers.get('x-tabletalk-notify-token')
  const expectedToken = process.env.NOTIFY_INTERNAL_TOKEN
  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: NotifyPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  await sendGuestIssueEmail(body)
  return NextResponse.json({ ok: true })
}
