'use server'

import { supabase } from '@/lib/supabase'
import { ISSUE_TYPE_TO_DB, ISSUE_PRIORITY_MAP } from '@/lib/db'
import { sendGuestIssueEmail } from '@/lib/notify'

export interface SubmitIssueInput {
  restaurantId: string
  restaurantName: string
  selectedType: string
  guestStatus: 'Still here' | 'Already left'
  tableNumber: string
  orderRef: string
  message: string
  contactName: string
  contactEmail: string
}

export async function submitIssue(input: SubmitIssueInput): Promise<{ error?: string }> {
  const {
    restaurantId, restaurantName, selectedType, guestStatus,
    tableNumber, orderRef, message, contactName, contactEmail,
  } = input

  const dbIssueType = ISSUE_TYPE_TO_DB[selectedType] ?? 'other'
  const dbPriority = ISSUE_PRIORITY_MAP[dbIssueType] ?? 'medium'

  const { error } = await supabase.from('guest_issues').insert({
    restaurant_id: restaurantId,
    issue_type: dbIssueType,
    priority: dbPriority,
    status: 'new',
    is_guest_still_here: guestStatus === 'Still here',
    table_number: tableNumber || null,
    order_identifier: orderRef || null,
    message: message || null,
    customer_name: contactName || null,
    customer_email: contactEmail || null,
  })

  if (error) {
    return { error: 'Something went wrong. Please try again.' }
  }

  // Fire-and-forget — email is best-effort, don't block the response
  sendGuestIssueEmail({
    restaurantName,
    issueType: selectedType,
    priority: dbPriority.charAt(0).toUpperCase() + dbPriority.slice(1),
    guestStatus,
    tableNumber: tableNumber || null,
    message: message || null,
  }).catch(() => {})

  return {}
}
