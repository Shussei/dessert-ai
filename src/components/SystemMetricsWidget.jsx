import { useState, useEffect } from "react"

// Live metrics store — updated by culinaryEngine calls
export const metrics = {
  responseTimeMs: 0,
  engineMode: "Idle",
  isOnline: false,
  listeners: [],
  update(mode, ms, online) {
    this.engineMode = mode
    this.responseTimeMs = ms
    this.isOnline = online
    this.listeners.forEach(fn => fn())
  },
  subscribe(fn) {
    this.listeners.push(fn)
    return () => { this.listeners = this.listeners.filter(l => l !== fn) }
  }
}

export default function SystemMetricsWidget({ className = "" }) {
  const [engineMode, setEngineMode] = useState(metrics.engineMode)
  const [responseTime, setResponseTime] = useState(metrics.responseTimeMs)
  const [isOnline, setIsOnline] = useState(metrics.isOnline)

  useEffect(() => {
    const unsub = metrics.subscribe(() => {
      setEngineMode(metrics.engineMode)
      setResponseTime(metrics.responseTimeMs)
      setIsOnline(metrics.isOnline)
    })
    return unsub
  }, [])

  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-cream-100 border border-cream-300 text-xs text-chocolate-600 font-mono ${className}`}>
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${isOnline ? "bg-sage-500" : "bg-caramel-400"}`}
          aria-hidden="true"
        />
        <span className="text-chocolate-400 hidden sm:inline">Engine:</span>
        <span className={`font-semibold ${isOnline ? "text-sage-600" : "text-caramel-600"}`}>
          {engineMode}
        </span>
      </div>
      {responseTime > 0 && (
        <>
          <span className="text-cream-400" aria-hidden="true">|</span>
          <span className="text-chocolate-400 hidden sm:inline">
            <span className="text-chocolate-600 font-bold">{responseTime}ms</span>
          </span>
        </>
      )}
    </div>
  )
}
