import type { Priority, Status, Ticket } from './mock-data'

export interface DbRestaurant {
  id: string
  created_at: string
  name: string
  slug: string
  location: string | null
  business_type: string | null
  owner_email: string | null
  is_active: boolean
}

export interface DbGuestIssue {
  id: string
  created_at: string
  restaurant_id: string
  issue_type: string
  priority: string
  status: string
  is_guest_still_here: boolean
  table_number: string | null
  order_identifier: string | null
  message: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  internal_notes: string | null
  resolved_at: string | null
}

export const ISSUE_TYPE_LABELS: Record<string, string> = {
  food_problem: 'Food problem',
  long_wait: 'Long wait',
  wrong_order: 'Wrong order',
  service_issue: 'Service issue',
  cleanliness_issue: 'Cleanliness issue',
  manager_request: 'Manager request',
  other: 'Other',
}

export const PRIORITY_LABELS: Record<string, Priority> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const STATUS_LABELS: Record<string, Status> = {
  new: 'New',
  seen: 'Seen',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

// UI label → DB value maps (for form submission)
export const ISSUE_TYPE_TO_DB: Record<string, string> = Object.fromEntries(
  Object.entries(ISSUE_TYPE_LABELS).map(([k, v]) => [v, k])
)

export const STATUS_TO_DB: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_LABELS).map(([k, v]) => [v, k])
)

// Auto-assign priority by issue type
export const ISSUE_PRIORITY_MAP: Record<string, string> = {
  food_problem: 'high',
  long_wait: 'medium',
  wrong_order: 'high',
  service_issue: 'medium',
  cleanliness_issue: 'high',
  manager_request: 'critical',
  other: 'low',
}

export function dbToTicket(issue: DbGuestIssue): Ticket {
  return {
    id: issue.id,
    type: ISSUE_TYPE_LABELS[issue.issue_type] ?? issue.issue_type,
    priority: (PRIORITY_LABELS[issue.priority] ?? 'Medium') as Priority,
    status: (STATUS_LABELS[issue.status] ?? 'New') as Status,
    message: issue.message ?? '',
    table: issue.table_number ?? '—',
    guestStatus: issue.is_guest_still_here ? 'Still here' : 'Already left',
    createdAt: issue.created_at,
    orderRef: issue.order_identifier ?? '—',
  }
}
