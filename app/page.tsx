import Link from 'next/link'
import { MessageSquare, Clock, Star, ArrowRight, QrCode, BellRing, CheckCircle2 } from 'lucide-react'

const DEMO_SLUG = process.env.NEXT_PUBLIC_DEMO_RESTAURANT_SLUG || 'sol-smoke-kitchen'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">TableTalk</span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1.5"
          >
            View Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-500 mb-10">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live at Sol &amp; Smoke Kitchen · San Antonio, TX
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6 max-w-3xl">
          Catch guest issues before they become bad reviews.
        </h1>

        <p className="text-lg text-gray-500 max-w-xl leading-relaxed mb-10">
          Guests scan a QR code, report problems privately, and your team resolves them
          before anyone leaves unhappy. No apps, no friction — just faster recovery.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-7 py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors text-sm"
          >
            View Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/r/${DEMO_SLUG}`}
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-7 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Try the guest form <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-gray-100 bg-gray-50 py-14">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-center mb-10">
            How it works
          </p>
          <div className="grid sm:grid-cols-3 gap-10 relative">
            <div className="hidden sm:block absolute top-5 left-[calc(33%-1rem)] right-[calc(33%-1rem)] h-px bg-gray-200" />
            {[
              {
                icon: QrCode,
                step: '01',
                title: 'Guest scans the QR',
                desc: 'One scan opens the private form — no app, no login, no waiting on hold.',
              },
              {
                icon: BellRing,
                step: '02',
                title: 'Your team is notified',
                desc: 'The issue lands in your live dashboard instantly. Staff see the table, the problem, the urgency.',
              },
              {
                icon: CheckCircle2,
                step: '03',
                title: 'Resolved before they leave',
                desc: 'One team member handles it on the spot. A bad experience becomes a recovery win.',
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center relative z-10">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-[10px] font-bold text-gray-300 tracking-widest mb-1">{step}</p>
                <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto w-full px-6 py-20">
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Guests report privately</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              No Yelp, no Google — guests tell you directly. You hear about problems your servers miss.
            </p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time for your team</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Issues appear live on your dashboard the moment a guest submits. No refreshing, no delay.
            </p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center mb-4">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Protect your rating</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              A guest who gets a quick resolution rarely leaves a bad review. Turn frustration into loyalty.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">TableTalk</span>
            <span className="text-gray-300 text-sm">·</span>
            <span className="text-sm text-gray-400">Guest issue recovery for restaurants</span>
          </div>
          <p className="text-sm text-gray-400">© 2025 TableTalk</p>
        </div>
      </footer>
    </div>
  )
}
