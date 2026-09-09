import { Link } from "react-router-dom"

const TICKER = [
  "SENSORY ANALYSIS",
  "STRUCTURAL BLUEPRINT",
  "FLAVOR PAIRING",
  "REFORMULATION",
  "AI-ASSISTED REASONING",
  "MUMENT 2026",
]

const WORKFLOW = [
  { step: "01", title: "Recipe", desc: "Ingredient composition and structure", tag: "INPUT" },
  { step: "02", title: "Ingredient Intelligence", desc: "Classify roles and functions", tag: "MAP" },
  { step: "03", title: "Flavor Relationships", desc: "Interactions and balance", tag: "WEIGH" },
  { step: "04", title: "Dessert Architecture", desc: "Structural layering", tag: "BUILD" },
  { step: "05", title: "Sensory Analysis", desc: "Dimensional profile", tag: "READ" },
  { step: "06", title: "Recommendations", desc: "Optimization and reasoning", tag: "ACT" },
]

const PRINCIPLES = [
  {
    title: "Evidence over precision",
    desc: "Analytical claims carry a source, method, and confidence level. We never present an AI estimate as a laboratory measurement.",
  },
  {
    title: "Explainable reasoning",
    desc: "Every major conclusion explains what the system considered, why it reached that conclusion, and what its limitations are.",
  },
  {
    title: "Honest uncertainty",
    desc: "When data is insufficient, the system says so rather than inventing a plausible-looking number.",
  },
]

export default function Home() {
  return (
    <div className="bg-cream-100">
      {/* Ticker */}
      <div className="overflow-hidden border-b-[3px] border-chocolate-900 bg-chocolate-900 text-saffron-300 py-1.5 ticker-mask" aria-hidden="true">
        <div className="flex whitespace-nowrap animate-marquee">
          {[0, 1].map((n) => (
            <span key={n} className="flex shrink-0 items-center">
              {TICKER.map((t) => (
                <span key={t + n} className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em]">
                  {t}
                  <span className="mx-5 text-cream-100">●</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="border-b-[3px] border-chocolate-900 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div className="animate-fade-in-up">
            <p className="font-mono text-[11px] text-saffron-600 font-bold uppercase tracking-[0.25em] mb-5">
              — MUMENT 2026 · AI culinary reasoning —
            </p>
            <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-extrabold text-chocolate-900 tracking-tight leading-[0.95] mb-6">
              Understand why
              <br />
              <span className="inline-block bg-saffron-300 border-2 border-chocolate-900 px-3 -rotate-1">
                your dessert
              </span>
              <br />
              works.
            </h1>
            <p className="text-chocolate-500 text-base sm:text-lg max-w-lg leading-relaxed mb-8">
              A research tool for pastry professionals. SavorSense reads recipe structure,
              sensory character, and ingredient interactions — and reports what it knows,
              with what confidence, and where it is uncertain.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/evaluator" className="btn-primary px-7 py-3.5 text-base">
                Analyze a Recipe →
              </Link>
              <Link to="/generator" className="btn-secondary px-7 py-3.5 text-base">
                Generate a Concept
              </Link>
            </div>
          </div>

          {/* Checkerboard panel */}
          <div className="relative animate-fade-in">
            <div className="checker border-2 border-chocolate-900 rounded-md shadow-warm-xl">
              <div className="bg-cream-100 border-b-2 border-chocolate-900 px-5 py-3 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-chocolate-800">Dessert Dossier</span>
                <span className="w-3 h-3 rounded-sm bg-saffron-400 border border-chocolate-900" aria-hidden="true" />
              </div>
              <div className="p-5 space-y-3">
                {[
                  { k: "Structure", v: "6 layers mapped" },
                  { k: "Sensory", v: "5 dimensions" },
                  { k: "Confidence", v: "Qualitative levels" },
                  { k: "Source", v: "Groq LLM · openai/gpt-oss-120b" },
                ].map((r) => (
                  <div key={r.k} className="flex items-center justify-between bg-white border-2 border-chocolate-900 rounded-sm px-3 py-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-chocolate-500">{r.k}</span>
                    <span className="text-[11px] font-semibold text-chocolate-900">{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-chocolate-900 px-5 py-2.5 flex items-center justify-between bg-white">
                <span className="font-mono text-[10px] uppercase tracking-widest text-chocolate-400">Zero fabrication</span>
                <span className="font-mono text-[10px] font-bold text-saffron-600">EST. 2026</span>
              </div>
            </div>
            <span className="absolute -bottom-4 -right-3 bg-chocolate-900 text-cream-100 font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 border-2 border-chocolate-900 rotate-2 shadow-warm">
              No fake scores
            </span>
          </div>
        </div>
      </section>

      {/* Checker divider */}
      <div className="h-4 checker border-b-[3px] border-chocolate-900" aria-hidden="true" />

      {/* Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between border-b-[3px] border-chocolate-900 pb-3 mb-8">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-chocolate-900 tracking-tight">
            From recipe to understanding
          </h2>
          <span className="font-mono text-[10px] text-chocolate-400 uppercase tracking-widest hidden sm:block">
            06 stages
          </span>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WORKFLOW.map((item) => (
            <li key={item.step} className="card-warm p-5 group hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl font-extrabold text-saffron-600 group-hover:text-chocolate-900 transition-colors">
                  {item.step}
                </span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-chocolate-400 border-2 border-chocolate-300 rounded-sm px-1.5 py-0.5">
                  {item.tag}
                </span>
              </div>
              <h3 className="font-display text-lg font-extrabold text-chocolate-900">{item.title}</h3>
              <p className="text-xs text-chocolate-400 leading-relaxed">{item.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Checker divider */}
      <div className="h-4 checker-invert border-y-[3px] border-chocolate-900" aria-hidden="true" />

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between border-b-[3px] border-chocolate-900 pb-3 mb-8">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-chocolate-900 tracking-tight">
            A culinary R&amp;D workspace
          </h2>
          <span className="font-mono text-[10px] text-chocolate-400 uppercase tracking-widest hidden sm:block">
            06 tools
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { to: "/evaluator", n: "01", title: "Evaluator", desc: "Deconstruct a dessert: structure, sensory profile, ingredient roles, and recommendations." },
            { to: "/flavorlab", n: "02", title: "Flavor Lab", desc: "Explore how two ingredients interact — compatibility, contrast, and culinary evidence." },
            { to: "/reformulate", n: "03", title: "Reformulation", desc: "Adapt a recipe to vegan, gluten-free, or keto with responsible trade-off analysis." },
            { to: "/compare", n: "04", title: "Comparison", desc: "Compare two formulations across sensory balance and structural design." },
            { to: "/generator", n: "05", title: "Generator", desc: "Generate structured, technically responsible dessert concepts." },
            { to: "/library", n: "06", title: "Research Library", desc: "Your personal notebook of analyses, recipes, and experiments." },
          ].map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="card-warm p-5 group flex flex-col gap-3 hover:-translate-x-1 hover:-translate-y-1 hover:bg-saffron-100 transition-all duration-150"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] text-chocolate-400 group-hover:text-chocolate-900 font-bold">{f.n}</span>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-sm bg-chocolate-900 text-cream-100 group-hover:bg-saffron-400 group-hover:text-chocolate-900 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M21 12H3" />
                  </svg>
                </span>
              </div>
              <h3 className="font-display text-lg font-extrabold text-chocolate-900">{f.title}</h3>
              <p className="text-xs text-chocolate-400 leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="bg-chocolate-900 border-t-[3px] border-chocolate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between border-b-2 border-chocolate-600 pb-3 mb-8">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-cream-100">
              How we treat data
            </h2>
            <span className="font-mono text-[10px] text-chocolate-400 uppercase tracking-widest hidden sm:block">
              03 principles
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className="bg-chocolate-800 border-2 border-chocolate-600 p-5 flex flex-col gap-3 rounded-md">
                <span className="font-display text-4xl font-extrabold text-saffron-400">0{i + 1}</span>
                <h3 className="font-display text-lg font-extrabold text-cream-100">{p.title}</h3>
                <p className="text-xs text-chocolate-300 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checker footer band */}
      <div className="h-4 checker" aria-hidden="true" />
    </div>
  )
}