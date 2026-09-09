import { Link } from "react-router-dom"

const SECTIONS = [
  {
    number: "01",
    title: "What SavorSense Does",
    body: [
      "SavorSense is an AI-assisted dessert analysis platform built for culinary research and development. Given a recipe, the system reads the list of ingredients, constituent layers, and preparation method, and produces a structured culinary dossier describing how the dessert is likely to behave.",
      "It does not taste food and it does not run experiments. It is a reasoning tool for pastry chefs who want a systematic second pass on a concept before committing to the final bake.",
    ],
  },
  {
    number: "02",
    title: "What It Analyzes",
    body: [
      "The analysis covers the dimensions a pastry chef weighs when developing a dessert:",
    ],
    items: [
      "Ingredients — each ingredient and its functional role (base, core, body, coating, garnish, sweetener, fat, acid, flavor, thickener).",
      "Structure — the layered architecture of the dessert, decomposed into a five-layer structural blueprint.",
      "Flavor — primary and secondary flavor families, pairing relationships, and qualitative sensory character.",
      "Texture — predicted mouthfeel, contrast between layers, and how technique affects the final crumb, aeration, or snap.",
      "Balance — whether sweetness, acidity, bitterness, richness, and salt are in proportion, plus an overall balance assessment.",
    ],
  },
  {
    number: "03",
    title: "How AI Is Used",
    body: [
      "The AI layer is served by the Groq LLM API (model is configured via the server's GROQ_MODEL setting, defaulting to llama-3.3-70b-versatile). The backend sends a strict, JSON-constrained prompt and the model returns a structured analysis object. The model has no sensory experience — it is performing culinary inference from food-science knowledge and classical pastry technique encoded in its training.",
      "The frontend never receives raw prose. Prompts enforce an exact JSON contract, and every response is tagged with its model, token usage, and a provenance marker before it reaches the interface.",
    ],
  },
  {
    number: "04",
    title: "Data Provenance",
    body: [
      "Every claim in the interface carries a provenance classification, shown as a small tag on the result cards:",
    ],
    items: [
      "AI-estimated — produced by the Groq LLM from the recipe text. This is inference, not measurement.",
      "Heuristic — derived by deterministic rules in the frontend, such as mapping a qualitative sensory level (low / moderate / high) to a radar value. Heuristics are approximations, never measurements.",
    ],
  },
  {
    number: "05",
    title: "What Is Calculated vs Estimated vs Unknown",
    body: [],
    items: [
      "Calculated — request metadata is measured directly: model name, token usage, wall-clock latency, and request identifiers. These are factual.",
      "Estimated — ingredient roles, structural layer definitions, sensory character, stability, shelf life, texture, and difficulty are all qualitative estimates produced by the AI from the recipe text.",
      "Unknown — SavorSense performs no laboratory analysis. It does not measure nutrition, microbial shelf life, water activity, rheology, or objective texture. Anything that would require a physical instrument or a tasting panel is outside the system's scope.",
    ],
  },
  {
    number: "06",
    title: "Limitations",
    body: [
      "SavorSense is built for concept development, not for certification, food-safety verdicts, or clinical work.",
    ],
    items: [
      "AI inference is not ground truth. The same recipe analyzed twice may produce different wording through a different model run.",
      "There are no laboratory measurements behind the results. All sensory, stability, and texture statements are reasoned estimates.",
      "Evaluations depend on model availability and prompt engineering. A recipe outside the model's pastry knowledge will be assessed less reliably.",
      "Results are qualitative by design. The platform deliberately avoids inventing precise numerical scores for taste.",
      "Any recommendation must be validated in the kitchen. Technique, timing, and yield statements from the generator should be treated as a starting point.",
    ],
  },
  {
    number: "07",
    title: "Architecture",
    body: [],
    items: [
      "Frontend — React with Vite and Tailwind CSS, styled around a warm culinary design system.",
      "Backend — an Express server exposing health, evaluation, flavor-pairing, generation, and reformulation endpoints, each with request logging and validation.",
      "AI — the Groq SDK streaming structured JSON from a configured Groq-hosted LLM model (GROQ_MODEL).",
      "Auth & persistence — Firebase Authentication for accounts and Firestore for the saved-recipe library.",
    ],
  },
]

function ProvenanceRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-xl bg-cream-200/60 border border-cream-300 p-4">
        <span className="provenance-tag bg-cream-200 text-chocolate-500 border border-cream-300 mb-2">Heuristic</span>
        <p className="mt-3 text-xs text-chocolate-500 leading-relaxed">
          Deterministic rule-based approximations applied in the frontend.
        </p>
      </div>
      <div className="rounded-xl bg-caramel-100 border border-caramel-300 p-4">
        <span className="provenance-tag bg-caramel-100 text-caramel-700 border border-caramel-300 mb-2">AI-Estimated</span>
        <p className="mt-3 text-xs text-chocolate-500 leading-relaxed">
          Qualitative inference produced by the Groq LLM from recipe text.
        </p>
      </div>
    </div>
  )
}

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      <header className="animate-fade-in-up">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="badge-warm">About the System</span>
          <span className="text-xs text-chocolate-400 font-mono">SavorSense · Technical Overview</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold text-chocolate-900 tracking-tight leading-tight">
          An AI-assisted dessert analysis system, described honestly.
        </h1>
        <p className="text-chocolate-500 mt-4 text-sm sm:text-base leading-relaxed max-w-3xl">
          SavorSense helps pastry chefs and recipe developers reason about desserts. This page is a plain-language
          account of what the system does, how it works, which claims it can support, and which claims it cannot.
        </p>
      </header>

      {SECTIONS.map((section) => (
        <section key={section.number} className="border-t border-cream-300 pt-10">
          <div className="flex items-start gap-5">
            <span className="font-mono text-sm font-bold text-caramel-500 pt-1 shrink-0">{section.number}</span>
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-bold text-chocolate-900 tracking-tight">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-sm sm:text-base text-chocolate-600 leading-relaxed">{paragraph}</p>
                ))}
                {section.items && (
                  <ul className="space-y-2.5 mt-1">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm sm:text-base text-chocolate-600 leading-relaxed">
                        <span className="text-caramel-500 mt-1 shrink-0">◆</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="border-t border-cream-300 pt-10">
        <div className="flex items-start gap-5">
          <span className="font-mono text-sm font-bold text-caramel-500 pt-1 shrink-0">08</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-bold text-chocolate-900 tracking-tight">Provenance at a glance</h2>
            <p className="mt-3 text-sm sm:text-base text-chocolate-600 leading-relaxed">
              Each result in the platform is classified into one of three provenance tiers:
            </p>
            <div className="mt-5">
              <ProvenanceRow />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-chocolate-900 p-8 sm:p-10">
        <h2 className="font-display text-2xl font-bold text-cream-100 tracking-tight">Team &amp; Competition</h2>
        <p className="mt-3 text-sm sm:text-base text-chocolate-200 leading-relaxed">
          SavorSense is an entry in the MUMENT 2026 Innovation Expo, built by Team NSSN. The project combines classic
          pastry knowledge with a live AI inference pipeline to explore what an explainable culinary R&amp;D assistant
          could look like.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <span className="px-3 py-1.5 rounded-full bg-caramel-100 border border-caramel-300 text-caramel-700 text-xs font-semibold">
            Team NSSN
          </span>
          <span className="px-3 py-1.5 rounded-full bg-cream-100 border border-cream-200 text-chocolate-700 text-xs font-semibold">
            MUMENT 2026 Innovation Expo
          </span>
          <a
            href="mailto:natalmadekkal.2005@gmail.com"
            className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-cream-100 text-xs font-semibold hover:bg-white/20 transition-colors"
          >
            Contact the team
          </a>
        </div>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-md bg-saffron-500 hover:bg-saffron-400 text-chocolate-900 font-semibold text-sm transition-all active:scale-[0.97]"
          >
            ← Back to the platform
          </Link>
        </div>
      </section>
    </div>
  )
}