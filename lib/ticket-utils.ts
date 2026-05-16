import type { Priority, Status } from './mock-data'

export function priorityConfig(priority: Priority) {
  switch (priority) {
    case 'Critical': return { label: 'Critical', className: 'bg-red-100 text-red-700 border-red-200' }
    case 'High':     return { label: 'High',     className: 'bg-orange-100 text-orange-700 border-orange-200' }
    case 'Medium':   return { label: 'Medium',   className: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
    case 'Low':      return { label: 'Low',      className: 'bg-green-100 text-green-700 border-green-200' }
  }
}

export function statusConfig(status: Status) {
  switch (status) {
    case 'New':         return { label: 'New',         className: 'bg-blue-100 text-blue-700 border-blue-200' }
    case 'Seen':        return { label: 'Seen',        className: 'bg-purple-100 text-purple-700 border-purple-200' }
    case 'In Progress': return { label: 'In Progress', className: 'bg-amber-100 text-amber-700 border-amber-200' }
    case 'Resolved':    return { label: 'Resolved',    className: 'bg-green-100 text-green-700 border-green-200' }
    case 'Closed':      return { label: 'Closed',      className: 'bg-slate-100 text-slate-500 border-slate-200' }
  }
}

export function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'Just now'
  if (diff === 1) return '1 min ago'
  if (diff < 60) return `${diff} min ago`
  const h = Math.floor(diff / 60)
  if (h < 24) return h === 1 ? '1 hr ago' : `${h} hrs ago`
  const d = Math.floor(h / 24)
  return d === 1 ? '1 day ago' : `${d} days ago`
}
