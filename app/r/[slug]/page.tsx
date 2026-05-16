'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  MessageSquare, CheckCircle2, Loader2,
  Utensils, Clock, AlertCircle, User, Sparkles, UserCog, HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { ISSUE_TYPE_TO_DB, ISSUE_PRIORITY_MAP } from '@/lib/db'
import type { DbRestaurant } from '@/lib/db'

const ISSUE_TYPES = [
  { label: 'Food problem',       Icon: Utensils    },
  { label: 'Long wait',          Icon: Clock       },
  { label: 'Wrong order',        Icon: AlertCircle },
  { label: 'Service issue',      Icon: User        },
  { label: 'Cleanliness issue',  Icon: Sparkles    },
  { label: 'Manager request',    Icon: UserCog     },
  { label: 'Other',              Icon: HelpCircle  },
]

export default function GuestSubmissionPage() {
  const params = useParams()
  const slug = params.slug as string

  const [restaurant, setRestaurant] = useState<DbRestaurant | null>(null)
  const [loadingRestaurant, setLoadingRestaurant] = useState(true)
  const [restaurantError, setRestaurantError] = useState(false)

  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [guestStatus, setGuestStatus] = useState<'Still here' | 'Already left'>('Still here')
  const [tableNumber, setTableNumber] = useState('')
  const [orderRef, setOrderRef] = useState('')
  const [message, setMessage] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRestaurant() {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        setRestaurantError(true)
      } else {
        setRestaurant(data)
      }
      setLoadingRestaurant(false)
    }
    fetchRestaurant()
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!restaurant || !selectedType) return

    setSubmitting(true)
    setSubmitError(null)

    const dbIssueType = ISSUE_TYPE_TO_DB[selectedType] ?? 'other'
    const dbPriority = ISSUE_PRIORITY_MAP[dbIssueType] ?? 'medium'

    const { error } = await supabase.from('guest_issues').insert({
      restaurant_id: restaurant.id,
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

    setSubmitting(false)

    if (error) {
      setSubmitError('Something went wrong. Please try again.')
    } else {
      setSubmitted(true)
    }
  }

  function resetForm() {
    setSubmitted(false)
    setSelectedType(null)
    setMessage('')
    setTableNumber('')
    setOrderRef('')
    setContactName('')
    setContactEmail('')
    setSubmitError(null)
  }

  if (loadingRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    )
  }

  if (restaurantError || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Restaurant not found.</p>
          <Link href="/" className="text-xs text-gray-400 underline mt-2 block">← Back to home</Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-sm w-full bg-white rounded-3xl border border-gray-200 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">We&apos;re on it.</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Thanks for telling us. Our team has been notified and will be right with you.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={resetForm}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
            >
              Submit another issue
            </button>
            <Link href="/" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 leading-none">{restaurant.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{restaurant.location}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">
            We want to make this right.
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Tell us what happened and a team member will be with you shortly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Issue type */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              What can we help with? <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ISSUE_TYPES.map(({ label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedType(label)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all',
                    label === 'Other' && 'col-span-2',
                    selectedType === label
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Still here / Already left */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Are you still at the restaurant?
            </label>
            <div className="flex gap-2">
              {(['Still here', 'Already left'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGuestStatus(option)}
                  className={cn(
                    'flex-1 py-3 rounded-xl border text-sm font-medium transition-all',
                    guestStatus === option
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Table + order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Table number</label>
              <input
                type="text"
                placeholder="e.g. 12"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-500 transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Order name / #</label>
              <input
                type="text"
                placeholder="e.g. John / 10"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-500 transition-colors bg-white"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Give us the details <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Walk us through what happened — the more you share, the faster we can help."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-500 transition-colors bg-white resize-none"
            />
          </div>

          {/* Optional contact */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Want us to follow up with you? (optional)
            </p>
            <input
              type="text"
              placeholder="Your name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-500 transition-colors"
            />
            <input
              type="email"
              placeholder="Email address"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-500 transition-colors"
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-500 text-center">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={!selectedType || !message.trim() || submitting}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending…
              </>
            ) : (
              'Send to our team'
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
