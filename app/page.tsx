import Link from 'next/link'
import { MessageSquare, Clock, Star, ArrowRight } from 'lucide-react'

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
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1"
          >
            View Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-500 mb-10">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Live at Sol &amp; Smoke Kitchen · San Antonio, TX
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6 max-w-3xl">
          Catch guest issues before they become bad reviews.
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl leading-relaxed mb-10">
          TableTalk gives restaurants a QR-powered guest issue desk so customers can
          report problems privately and managers can resolve them before they leave unhappy.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-7 py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors text-sm"
          >
            View Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/r/sol-smoke-kitchen"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-200 px-7 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Try Guest Issue Flow
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto w-full px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Guests report privately</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Guests scan a QR code at the table and submit issues in seconds — no app download, no friction.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">You respond instantly</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your team sees guest issues in real time and can act before the guest leaves the building.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mb-4">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Protect your reputation</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Turn a bad experience into a recovery win. Resolve issues on the spot and keep your stars.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2025 TableTalk · Built for restaurants
      </footer>
    </div>
  )
}
