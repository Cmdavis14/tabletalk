'use client'

import Link from 'next/link'
import QRCode from 'react-qr-code'
import { ArrowLeft, Printer, Copy, CheckCircle2, Lock } from 'lucide-react'
import { useState } from 'react'

interface Props {
  restaurantName: string
  guestUrl: string
}

export default function QRClient({ restaurantName, guestUrl }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(guestUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Screen-only header */}
      <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? (
                <><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Copied</>
              ) : (
                <><Copy className="w-3.5 h-3.5" /> Copy link</>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-sm bg-black text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>
      </header>

      {/* Screen preview */}
      <main className="max-w-3xl mx-auto px-6 py-10 print:hidden">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-900">QR Code — Table Card</h1>
          <p className="text-sm text-gray-400 mt-1">
            Print and place on tables, the receipt counter, or takeout bags.
          </p>
        </div>

        {/* Preview card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center text-center max-w-sm mx-auto shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {restaurantName}
          </p>
          <h2 className="text-xl font-bold text-gray-900 leading-snug mb-6">
            Something not right?<br />
            Tell us privately —<br />
            we&apos;ll fix it now.
          </h2>

          <div className="bg-white p-3 rounded-xl border border-gray-100 mb-6">
            <QRCode
              value={guestUrl}
              size={180}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>

          <p className="text-[11px] text-gray-400 break-all font-mono mb-5">{guestUrl}</p>

          <div className="pt-5 border-t border-gray-100 w-full">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" />
              Private · No app needed · Takes 30 seconds
            </p>
          </div>
        </div>
      </main>

      {/* ── Print-only layout ── */}
      <div className="hidden print:flex print:min-h-screen print:items-center print:justify-center print:bg-white">
        <div className="print-card flex flex-col items-center text-center" style={{ width: '3.5in', padding: '0.4in' }}>
          <p style={{ fontSize: '9pt', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6pt' }}>
            {restaurantName}
          </p>
          <h2 style={{ fontSize: '20pt', fontWeight: 800, lineHeight: 1.15, color: '#111827', marginBottom: '20pt' }}>
            Something not right?<br />
            Tell us privately —<br />
            we&apos;ll fix it now.
          </h2>

          <div style={{ background: '#fff', padding: '10pt', border: '1pt solid #e5e7eb', borderRadius: '8pt', marginBottom: '16pt', display: 'inline-block' }}>
            <QRCode
              value={guestUrl}
              size={160}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>

          <p style={{ fontSize: '7pt', color: '#9ca3af', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '14pt' }}>
            {guestUrl}
          </p>

          <div style={{ borderTop: '1pt solid #e5e7eb', paddingTop: '10pt', width: '100%' }}>
            <p style={{ fontSize: '8pt', color: '#9ca3af' }}>
              Private · No app needed · Takes 30 seconds
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: 3.5in 5in;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
