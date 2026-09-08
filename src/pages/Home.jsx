import { Link } from "react-router-dom"

const WORKFLOW = [
  { step: "1", title: "Recipe", desc: "Ingredient composition and structure" },
  { step: "2", title: "Ingredient Intelligence", desc: "Classify roles and functions" },
  { step: "3", title: "Flavor Relationships", desc: "Interactions and balance" },
  { step: "4", title: "Dessert Architecture", desc: "Structural layering" },
  { step: "5", title: "Sensory Analysis", desc: "Dimensional profile" },
  { step: "6", title: "Recommendations", desc: "Optimization and reasoning" },
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
      <section className="relative overflow-hidden border-b border-cream-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-200/80 border border-cream-300 text-xs font-semibold text-caramel-700 mb-8 shadow-warm">
            <span className="w-1.5 h-1.5 rounded-full bg-caramel-500" aria-hidden="true" />
            AI-assisted culinary reasoning for pastry professionals
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-chocolate-900 tracking-tight leading-tight mb-6">
            Understand why
            <br />
            <span className="text-dustyrose-600 italic">your dessert works.</span>
          </h1>

          <p className="text-chocolate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Analyze flavor, structure, texture, ingredient interactions, and balance with
            AI-assisted culinary reasoning. SavorSense is a research tool for understanding
            desserts — not a score generator.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/evaluator"
              className="px-6 py-3 rounded-xl bg-chocolate-800 hover:bg-chocolate-700 text-cream-100 font-semibold text-sm shadow-warm-lg transition-all active:scale-[0.98]"
            >
              Analyze a Recipe
            </Link>
            <Link
              to="/generator"
              className="px-6 py-3 rounded-xl bg-cream-100 hover:bg-cream-200 border border-caramel-300 text-chocolate-700 font-semibold text-sm transition-all active:scale-[0.98]"
            >
              Generate a Recipe
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="section-heading">From recipe to understanding</h2>
          <p className="section-subheading max-w-xl mx-auto">
            A structured analysis pipeline that turns a recipe into culinary reasoning
          </p>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKFLOW.map((item) => (
            <li key={item.step} className="card-warm p-5 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-cream-200 border border-caramel-300 flex items-center justify-center text-sm font-display font-bold text-chocolate-700">
                  {item.step}
                </span>
                <h3 className="font-display text-base font-bold text-chocolate-900">{item.title}</h3>
              </div>
              <p className="text-xs text-chocolate-400 leading-relaxed">{item.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Feature Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="text-center mb-10">
          <h2 className="section-heading">A culinary R&D workspace</h2>
          <p className="section-subheading max-w-xl mx-auto">
            Explore the tools built on this foundation
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { to: "/evaluator", title: "Evaluator", desc: "Deconstruct a dessert: structure, sensory profile, ingredient roles, and recommendations." },
            { to: "/flavorlab", title: "Flavor Lab", desc: "Explore how two ingredients interact — compatibility, contrast, and culinary evidence." },
            { to: "/reformulate", title: "Reformulation", desc: "Adapt a recipe to vegan, gluten-free, or keto with responsible trade-off analysis." },
            { to: "/compare", title: "Comparison", desc: "Compare two formulations across sensory balance and structural design." },
            { to: "/generator", title: "Generator", desc: "Generate structured, technically responsible dessert concepts." },
            { to: "/library", title: "Research Library", desc: "Your personal notebook of analyses, recipes, and experiments." },
          ].map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="card-warm-hover p-5 group flex flex-col gap-2"
            >
              <h3 className="font-display text-base font-bold text-chocolate-900 group-hover:text-dustyrose-600 transition-colors">
                {f.title}
              </h3>
              <p className="text-xs text-chocolate-400 leading-relaxed">{f.desc}</p>
              <span className="mt-auto text-caramel-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="bg-cream-100 border-t border-cream-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="section-heading">How we treat data</h2>
            <p className="section-subheading max-w-xl mx-auto">
              Accuracy and honesty over impressive-looking numbers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="card-warm p-5">
                <h3 className="font-display text-base font-bold text-chocolate-900 mb-2">{p.title}</h3>
                <p className="text-xs text-chocolate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
