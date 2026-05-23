import { Resend } from 'resend'

export interface NotifyPayload {
  restaurantName: string
  issueType: string
  priority: string
  guestStatus: string
  tableNumber: string | null
  message: string | null
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendGuestIssueEmail(payload: NotifyPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  const to = process.env.NOTIFY_EMAIL

  if (!apiKey || !from || !to) {
    console.error('[notify] Missing env vars — RESEND_API_KEY, RESEND_FROM_EMAIL, or NOTIFY_EMAIL not set')
    return
  }

  const resend = new Resend(apiKey)
  const { restaurantName, issueType, priority, guestStatus, tableNumber, message } = payload

  const priorityEmoji: Record<string, string> = {
    Critical: '🔴',
    High: '🟠',
    Medium: '🟡',
    Low: '🟢',
  }
  const emoji = priorityEmoji[priority] ?? '⚪'
  const table = tableNumber ? `Table ${escapeHtml(tableNumber)}` : 'No table given'

  const safeRestaurantName = escapeHtml(restaurantName)
  const safeIssueType = escapeHtml(issueType)
  const safePriority = escapeHtml(priority)
  const safeGuestStatus = escapeHtml(guestStatus)
  const safeMessage = message ? escapeHtml(message) : null

  const subject = `${emoji} ${priority} — ${issueType} at ${restaurantName}`

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <div style="background:#07111F;border-radius:12px;padding:20px 24px;margin-bottom:20px">
        <p style="color:#009B9A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px">
          TableTalk · New Guest Issue
        </p>
        <p style="color:white;font-size:20px;font-weight:700;margin:0">${safeRestaurantName}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;width:120px">Issue type</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px">${safeIssueType}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px">Priority</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px">${emoji} ${safePriority}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px">Guest status</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px">${safeGuestStatus}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748b;font-size:13px">Location</td>
          <td style="padding:10px 0;font-weight:600;font-size:13px">${table}</td>
        </tr>
      </table>

      ${safeMessage ? `
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px">
        <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px">Guest message</p>
        <p style="color:#1e293b;font-size:14px;line-height:1.6;margin:0">&ldquo;${safeMessage}&rdquo;</p>
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
    }
  } catch (err) {
    console.error('[notify] Unexpected error:', err)
  }
}
