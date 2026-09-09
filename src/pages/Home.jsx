import { Link } from "react-router-dom"

const WORKFLOW = [
  { step: "01", title: "Recipe", desc: "Ingredient composition and structure" },
  { step: "02", title: "Ingredient Intelligence", desc: "Classify roles and functions" },
  { step: "03", title: "Flavor Relationships", desc: "Interactions and balance" },
  { step: "04", title: "Dessert Architecture", desc: "Structural layering" },
  { step: "05", title: "Sensory Analysis", desc: "Dimensional profile" },
  { step: "06", title: "Recommendations", desc: "Optimization and reasoning" },
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
      {/* Hero */}
      <section className="border-b border-cream-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          <p className="font-mono text-[11px] text-saffron-600 font-medium uppercase tracking-[0.2em] mb-6">
            MUMENT 2026 · AI-assisted culinary reasoning
          </p>

          <h1 className="font-display text-4xl sm:text-6xl font-semibold text-chocolate-900 tracking-tight leading-[1.05] mb-6">
            Understand why
            <span className="italic text-saffron-600"> your dessert</span>
            <br className="hidden sm:block" />
            works.
          </h1>

          <p className="text-chocolate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            A research tool for pastry professionals. SavorSense analyzes flavor,
            structure, texture, and ingredient interactions — and reports what it
            knows, with what confidence, and where it is uncertain.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/evaluator" className="btn-primary px-7 py-3">
              Analyze a Recipe
            </Link>
            <Link to="/generator" className="btn-secondary px-7 py-3">
              Generate a Concept
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-baseline justify-between border-t border-chocolate-200 pt-4 mb-10">
          <h2 className="section-heading text-xl">From recipe to understanding</h2>
          <span className="font-mono text-[10px] text-chocolate-300 uppercase tracking-widest hidden sm:block">
            06 stages
          </span>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-cream-300 border border-cream-300 rounded-lg overflow-hidden">
          {WORKFLOW.map((item) => (
            <li key={item.step} className="bg-white p-5 flex flex-col gap-2">
              <span className="font-mono text-[10px] text-saffron-600">{item.step}</span>
              <h3 className="font-display text-base font-semibold text-chocolate-900">{item.title}</h3>
              <p className="text-xs text-chocolate-400 leading-relaxed">{item.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Feature Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-baseline justify-between border-t border-chocolate-200 pt-4 mb-10">
          <h2 className="section-heading text-xl">A culinary R&amp;D workspace</h2>
          <span className="font-mono text-[10px] text-chocolate-300 uppercase tracking-widest hidden sm:block">
            06 tools
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-cream-300 border border-cream-300 rounded-lg overflow-hidden">
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
              className="bg-white p-5 group flex flex-col gap-2 transition-colors duration-150 hover:bg-cream-100"
            >
              <span className="font-mono text-[10px] text-chocolate-300 group-hover:text-saffron-600 transition-colors">{f.n}</span>
              <h3 className="font-display text-base font-semibold text-chocolate-900">{f.title}</h3>
              <p className="text-xs text-chocolate-400 leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="bg-chocolate-900 border-t border-chocolate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-display text-xl font-semibold text-cream-100">How we treat data</h2>
            <span className="font-mono text-[10px] text-chocolate-400 uppercase tracking-widest">03 principles</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-chocolate-700 border border-chocolate-700 rounded-lg overflow-hidden">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="bg-chocolate-900 p-5">
                <h3 className="font-display text-base font-semibold text-cream-100 mb-2">{p.title}</h3>
                <p className="text-xs text-chocolate-300 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}