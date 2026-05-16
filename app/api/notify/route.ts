import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface NotifyPayload {
  restaurantName: string
  issueType: string
  priority: string
  guestStatus: string
  tableNumber: string | null
  message: string | null
}

export async function POST(request: Request) {
  const from = process.env.RESEND_FROM_EMAIL
  const to = process.env.NOTIFY_EMAIL

  if (!process.env.RESEND_API_KEY || !from || !to) {
    console.error('[notify] Missing env vars — RESEND_API_KEY, RESEND_FROM_EMAIL, or NOTIFY_EMAIL not set')
    return NextResponse.json({ error: 'Email notifications not configured' }, { status: 500 })
  }

  let body: NotifyPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { restaurantName, issueType, priority, guestStatus, tableNumber, message } = body

  const priorityEmoji: Record<string, string> = {
    Critical: '🔴',
    High: '🟠',
    Medium: '🟡',
    Low: '🟢',
  }
  const emoji = priorityEmoji[priority] ?? '⚪'
  const table = tableNumber ? `Table ${tableNumber}` : 'No table given'

  const subject = `${emoji} ${priority} — ${issueType} at ${restaurantName}`

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <div style="background:#07111F;border-radius:12px;padding:20px 24px;margin-bottom:20px">
        <p style="color:#009B9A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px">
          TableTalk · New Guest Issue
        </p>
        <p style="color:white;font-size:20px;font-weight:700;margin:0">${restaurantName}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;width:120px">Issue type</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px">${issueType}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px">Priority</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px">${emoji} ${priority}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px">Guest status</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px">${guestStatus}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748b;font-size:13px">Location</td>
          <td style="padding:10px 0;font-weight:600;font-size:13px">${table}</td>
        </tr>
      </table>

      ${message ? `
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px">
        <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px">Guest message</p>
        <p style="color:#1e293b;font-size:14px;line-height:1.6;margin:0">&ldquo;${message}&rdquo;</p>
      </div>
      ` : ''}

      <p style="color:#94a3b8;font-size:12px;margin:0">
        Open the TableTalk dashboard to update this ticket.
      </p>
    </div>
  `

  try {
    const { error } = await resend.emails.send({ from, to, subject, html })
    if (error) {
      console.error('[notify] Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[notify] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
