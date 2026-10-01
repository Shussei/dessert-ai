import { useRef, useState, useEffect } from "react"

export const TEAM_EMAIL = "natalmadekkal.2005@gmail.com"

function CopyIcon({ done }) {
  if (done) {
    return (
      <svg className="w-3.5 h-3.5 text-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )
  }
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7h8m-9 0H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
    </svg>
  )
}

export default function EmailContactButton({ label = "Contact the team", className = "" }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [open])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(TEAM_EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt("Copy the team email:", TEAM_EMAIL)
    }
  }

  const menuItem = "w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 uppercase tracking-wide transition-colors"

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={className}
      >
        {label}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-[220px] rounded-md bg-cream-50 border-2 border-chocolate-900 shadow-warm-xl z-50 overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 pt-2 pb-1 border-b-2 border-cream-300">
            <span className="text-[10px] text-chocolate-400 font-mono break-all">{TEAM_EMAIL}</span>
          </div>
          <a
            role="menuitem"
            className={`${menuItem} text-caramel-700 hover:bg-saffron-100`}
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(TEAM_EMAIL)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Open in Gmail
          </a>
          <a
            role="menuitem"
            className={`${menuItem} text-chocolate-700 hover:bg-saffron-100`}
            href={`mailto:${TEAM_EMAIL}`}
            onClick={() => setOpen(false)}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Use email app
          </a>
          <button
            type="button"
            role="menuitem"
            className={`${menuItem} text-chocolate-700 hover:bg-saffron-100 w-full`}
            onClick={handleCopy}
          >
            {copied ? <CopyIcon done /> : <CopyIcon />}
            {copied ? "Copied ✓" : "Copy address"}
          </button>
        </div>
      )}
    </div>
  )
}