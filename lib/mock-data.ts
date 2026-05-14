export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'
export type Status = 'New' | 'Seen' | 'In Progress' | 'Resolved' | 'Closed'
export type GuestStatus = 'Still here' | 'Already left'

export interface Ticket {
  id: string
  type: string
  priority: Priority
  status: Status
  message: string
  table: string
  guestStatus: GuestStatus
  createdAt: string
  orderRef: string
}
