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
import type { DbRestaurant } from '@/lib/db'
import { submitIssue } from './actions'

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

    const result = await submitIssue({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      selectedType,
      guestStatus,
      tableNumber,
      orderRef,
      message,
      contactName,
      contactEmail,
    })

    setSubmitting(false)

    if (result.error) {
      setSubmitError(result.error)
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      </div>
    )
  }

  if (restaurantError || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-slate-500 text-sm">Restaurant not found.</p>
          <Link href="/" className="text-xs text-slate-400 underline mt-2 block">← Back to home</Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-sm w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-[#DDFBFA] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#009B9A]" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">We&apos;re on it.</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Thanks for telling us. Our team has been notified and will be right with you.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={resetForm}
              className="text-sm text-slate-400 hover:text-slate-700 transition-colors underline underline-offset-2"
            >
              Submit another issue
            </button>
            <Link href="/" className="text-xs text-slate-300 hover:text-slate-500 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#07111F] to-[#009B9A] flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900 leading-none">{restaurant.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{restaurant.location}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-snug">
            We want to make this right.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Tell us what happened and a team member will be with you shortly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Issue type */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              What can we help with? <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ISSUE_TYPES.map(({ label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedType(label)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-3 rounded-xl border text-[13px] font-medium text-left transition-all',
                    label === 'Other' && 'col-span-2',
                    selectedType === label
                      ? 'bg-[#07111F] text-white border-[#07111F] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Still here / Already left */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-3">
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
                      ? 'bg-[#07111F] text-white border-[#07111F] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
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
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Table number</label>
              <input
                type="text"
                placeholder="e.g. 12"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#009B9A] transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Order name / #</label>
              <input
                type="text"
                placeholder="e.g. John / 10"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#009B9A] transition-colors bg-white"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Give us the details <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Walk us through what happened — the more you share, the faster we can help."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#009B9A] transition-colors bg-white resize-none"
            />
          </div>

          {/* Optional contact */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Want us to follow up with you? (optional)
            </p>
            <input
              type="text"
              placeholder="Your name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#009B9A] transition-colors"
            />
            <input
              type="email"
              placeholder="Email address"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#009B9A] transition-colors"
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-500 text-center">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={!selectedType || !message.trim() || submitting}
            className="w-full bg-[#009B9A] hover:bg-[#008786] text-white py-4 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
