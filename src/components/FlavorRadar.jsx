import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js"
import { Radar } from "react-chartjs-2"

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

// Map qualitative level to a 1-10 value for visualization only.
// NOTE: These are display heuristics, clearly labeled as AI-estimated directions,
// not measured intensities.
const LEVEL_VALUE = { low: 2, moderate: 5, high: 8 }

function levelToValue(entry) {
  if (entry == null) return null
  if (typeof entry === "object" && entry.level) return LEVEL_VALUE[entry.level] ?? 5
  if (typeof entry === "number") return entry
  if (typeof entry === "string") return LEVEL_VALUE[entry.toLowerCase()] ?? 5
  return null
}

function scoreToColor(value) {
  if (value === null) return { bg: "rgba(180,150,130,0.1)", border: "rgba(180,150,130,0.8)" }
  const factor = Math.min(1, Math.max(0, value / 10))
  const r = Math.round(155 - 100 * factor)
  const g = Math.round(130 - 70 * factor)
  const b = Math.round(100 + 40 * factor)
  return {
    bg: `rgba(${r},${g},${b},0.18)`,
    border: `rgba(${r},${g},${b},0.9)`,
  }
}

export default function FlavorRadar({
  radarData = null,
  comparisonData = null,
  title = "Sensory Profile",
  label1 = "Primary Concept",
  label2 = "Comparison Concept",
}) {
  const labels = ["Sweetness", "Acidity", "Bitterness", "Richness", "Aroma", "Texture", "Contrast"]

  function buildValues(data) {
    if (!data) return null
    return labels.map(label => {
      const key = label.toLowerCase()
      return levelToValue(data[key] ?? data[key + "Level"])
    })
  }

  const v1 = buildValues(radarData)
  const v2 = buildValues(comparisonData)

  // If no data available at all, don't render a fabricated chart
  if (!v1 || v1.every(v => v === null)) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-warm flex flex-col items-center">
        <div className="w-full text-left mb-4">
          <h3 className="font-display text-lg font-bold text-chocolate-900 tracking-tight">{title}</h3>
          <p className="text-xs text-chocolate-400 mt-1">No sensory data available for visualization.</p>
        </div>
        <p className="text-sm text-chocolate-400 italic py-8">Sensory levels are not available for this analysis.</p>
      </div>
    )
  }

  const datasets = []

  const c1 = scoreToColor(v1.includes(null) ? null : v1.reduce((a, b) => a + b, 0) / v1.length)
  datasets.push({
    label: label1,
    data: v1.map(v => (v === null ? 0 : v)),
    backgroundColor: c1.bg,
    borderColor: c1.border,
    borderWidth: 2,
    pointBackgroundColor: c1.border,
    pointBorderColor: "#fff",
    pointHoverBackgroundColor: "#fff",
    pointHoverBorderColor: c1.border,
  })

  if (v2 && !v2.every(v => v === null)) {
    const c2 = scoreToColor(v2.reduce((a, b) => a + b, 0) / v2.length)
    datasets.push({
      label: label2,
      data: v2.map(v => (v === null ? 0 : v)),
      backgroundColor: c2.bg,
      borderColor: c2.border,
      borderWidth: 2,
      pointBackgroundColor: c2.border,
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: c2.border,
    })
  }

  const data = { labels, datasets }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: "rgba(74,46,20,0.15)" },
        grid: { color: "rgba(74,46,20,0.15)" },
        pointLabels: {
          color: "#3D2212",
          font: { size: 11, weight: "bold" },
        },
        ticks: {
          backdropColor: "transparent",
          color: "#A47B50",
          stepSize: 2,
          beginAtZero: true,
          max: 10,
        },
        min: 0,
        max: 10,
      },
    },
    plugins: {
      legend: {
        display: !!comparisonData,
        labels: { color: "#3D2212", font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: "rgba(245,246,242,0.95)",
        titleColor: "#3D2212",
        bodyColor: "#6B4A2E",
        borderColor: "rgba(200,149,106,0.5)",
        borderWidth: 1,
      },
    },
  }

  return (
    <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-warm flex flex-col items-center">
      <div className="w-full text-left mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold text-chocolate-900 tracking-tight">{title}</h3>
          <span className="provenance-tag bg-caramel-100 text-caramel-700 border border-caramel-300">
            AI-Estimated
          </span>
        </div>
        <p className="text-xs text-chocolate-400 mt-1">
          Qualitative sensory directions (Low / Moderate / High) mapped to a 1–10 display axis.
          These are AI estimates, not measured intensities.
        </p>
      </div>

      <div className="w-full h-72 relative">
        <Radar data={data} options={options} />
      </div>
    </div>
  )
}
