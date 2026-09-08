import { useState } from "react"

export default function QRCodeModal({ isOpen, onClose, recipeName }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareUrl = `${window.location.origin}/evaluator?recipe=${encodeURIComponent(recipeName || "dessert")}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.getElementById("share-url-input")
      if (input) {
        input.select()
        document.execCommand("copy")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/50 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-cream-300 shadow-warm-xl relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 border border-cream-300 text-chocolate-400 hover:text-chocolate-700 flex items-center justify-center transition-all text-sm"
        >
          &#x2715;
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-caramel-100 border border-caramel-300 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-caramel-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="font-display text-xl font-bold text-chocolate-900">Share Recipe</h3>
          <p className="text-xs text-chocolate-400 mt-1">Copy the link below to share this recipe analysis</p>
        </div>

        <div className="p-4 rounded-xl bg-cream-100 border border-cream-300 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-cream-300 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-caramel-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-chocolate-900 truncate">{recipeName || "Dessert Recipe"}</p>
              <p className="text-xs text-chocolate-400 mt-0.5">
                AI-estimated analysis
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              id="share-url-input"
              type="text"
              value={shareUrl}
              readOnly
              className="w-full bg-white border border-cream-300 text-chocolate-900 text-xs font-mono px-4 py-3 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-chocolate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              copied
                ? "bg-sage-100 text-sage-600 border border-sage-300"
                : "bg-gradient-to-r from-chocolate-600 to-chocolate-700 hover:from-chocolate-500 hover:to-chocolate-600 text-white shadow-warm hover:shadow-warm-lg"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied to Clipboard
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </>
            )}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-cream-200 text-center">
          <p className="text-[10px] text-chocolate-300 font-mono uppercase tracking-wider">
            SavorSense AI Culinary R&D Platform
          </p>
        </div>
      </div>
    </div>
  )
}
