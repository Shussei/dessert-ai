const ACTION_WORDS = {
  reduce: /(reduce|lower|decrease|cut|halve|halved|less|omit|remove|drop)/i,
  increase: /(increase|raise|add more|double|boost)/i,
  remove: /(remove|eliminate|omit|drop|take out|delete|take away)/i,
  replace: /(replace|substitute|swap|exchange|swap out)/i,
  add: /(add|introduce|incorporate)/i,
}

const CATEGORY_KEYWORDS = [
  { category: "sweetener", re: /(sugar|sweetener|honey|syrup|molasses|brown sugar|confectioner['\u2019]s sugar|agave|stevia|sucrose)/i },
  { category: "egg", re: /(egg|eggs|egg white|egg yolk)/i },
  { category: "fat", re: /(butter|oil|shortening|margarine|lard|tallow|cocoa butter|coconut oil|ghee)/i },
  { category: "structure", re: /(flour|starch|cornstarch|almond flour|semolina|breadcrumb)/i },
  { category: "dairy", re: /(milk|cream|yogurt|buttermilk|cheese|creme|cr\u00e8me|custard|ganache|mascarpone)/i },
  { category: "liquid", re: /(water|juice|pur\u00e9e|puree|wine)/i },
  { category: "thickener", re: /(gelatin|agar|pectin|gellan)/i },
  { category: "leavener", re: /(baking powder|baking soda|yeast|cream of tartar)/i },
  { category: "seasoning", re: /(salt)/i },
  { category: "flavor", re: /(chocolate|cocoa|vanilla|caramel|coffee|matcha|lemon|raspberry|hazelnut|pistachio|yuzu|spice)/i },
]

const TEXT_FLAG_KEYWORDS = {
  structure: /(flour|starch|cake|sponge|sabr\u00e9|biscuit|genoise|short(?:bread|cake)?|dough)/i,
  foam: /(meringue|mousse|bavarian|chiffon|souffl\u00e9|whipped|angel)/i,
  custard: /(custard|cr\u00e8meux|cremeux|creme br\u00fbl\u00e9e|ganache|pudd)/i,
  glaze: /(mirror glaze|glaze|fondant|icing|frosting)/i,
}

export function classifyRolesFromText(text) {
  if (!text || typeof text !== "string") return {}
  const t = text.toLowerCase()
  const flags = {}
  for (const [flag, re] of Object.entries(TEXT_FLAG_KEYWORDS)) flags[flag] = re.test(t)
  for (const { category, re } of CATEGORY_KEYWORDS) flags[category] = re.test(t)
  flags.sweetenerPresent = flags.sweetener
  flags.eggPresent = flags.egg
  flags.fatPresent = flags.fat
  flags.structurePresent = flags.structure
  return flags
}

export function detectModification(modText) {
  const input = modText || ""
  let action = "adjust"
  for (const [candidate, re] of Object.entries(ACTION_WORDS)) {
    if (re.test(input)) { action = candidate; break }
  }

  let category = null
  for (const { category: cat, re } of CATEGORY_KEYWORDS) {
    if (re.test(input)) { category = cat; break }
  }

  const pctMatch = input.match(/(\d+(?:\.\d+)?)\s*%/)
  const pct = pctMatch ? Math.min(100, Math.max(1, parseFloat(pctMatch[1]))) : null

  const summarise = () => {
    if (action === "replace") {
      const withMatch = input.match(/\bwith\s+(.{1,40})/i)
      return { summary: withMatch ? `Replace ${category || "an ingredient"} with ${withMatch[1].trim()}` : `Replace the ${category || "target ingredient"}`, target: withMatch ? withMatch[1].trim() : null }
    }
    const base = category ? `the ${category}` : "an ingredient"
    if (action === "add") return { summary: `Add ${category || "an ingredient"}${pct ? ` (targeting a ~${pct}% change in that share)` : ""}`, target: null }
    const amount = pct ? ` by ~${pct}%` : ""
    return { summary: `${action[0].toUpperCase() + action.slice(1)} ${base}${amount}`, target: null }
  }

  return { action, category, pct, ...summarise(), valid: !!category }
}

function has(targetCategory, textFlags) {
  return textFlags[targetCategory] || false
}

export function groundingNotes(mod, flags) {
  const notes = []
  const category = mod.category
  const action = mod.action

  if (category === "sweetener") {
    if (has("sweetener", flags)) notes.push("Grounding: sugar is referenced in the recipe — treated as the primary sweetener.")
    else notes.push("Grounding: no explicit sugar/sweetener reference was found in the text.")
    if (action === "remove" || action === "reduce") {
      if (has("foam", flags)) notes.push("Grounding (sugar role): in whipped-across aerated preparations (meringue/mousse), sugar supports foam structure, not just sweetness.")
      else notes.push("Grounding (sugar role): sugar contributes sweetness, browning, and moisture retention in baked structure.")
      if (mod.pct) notes.push(`Grounding (magnitude): the request targets a ~${mod.pct}% reduction. Without a machine-parseable absolute weight, the effect is treated nominally and qualitatively.`)
    } else if (action === "increase") {
      notes.push("Grounding (sugar role): more sugar raises sweetness and browning; risk of crystallization or overly dense layers.")
    }
  }

  if (category === "egg") {
    if (has("egg", flags)) notes.push("Grounding: eggs are referenced in the recipe — noted as both binder and aerator.")
    else notes.push("Grounding: no explicit egg reference was found in the text.")
    if (action === "remove" || action === "reduce") {
      if (has("foam", flags) || has("custard", flags)) notes.push("Grounding (egg role): eggs set and stabilize; their removal in a foam/custard risks collapse or weak set.")
      else notes.push("Grounding (egg role): eggs bind and tenderize; removal typically requires an alternative binder.")
    }
  }

  if (category === "fat") {
    if (has("fat", flags)) notes.push("Grounding: a fat source (butter/oil) is referenced in the recipe.")
    if (action === "remove" || action === "reduce") {
      notes.push("Grounding (fat role): fat carries flavor and shortens texture; reduction tends to produce a drier, less tender result.")
    }
  }

  if (category === "structure") {
    if (has("structure", flags)) notes.push("Grounding: a flour/structural ingredient is referenced.")
    if (action === "remove" || action === "reduce") {
      notes.push("Grounding (structure role): reducing structure lowers gluten/starch support — expect denser crumb or collapse unless compensated.")
    }
  }

  if (category === "dairy" && (action === "remove" || action === "replace")) {
    notes.push("Grounding (dairy role): dairy contributes richness and moisture; removal changes mouthfeel and set behavior.")
  }

  if (!mod.valid) {
    notes.push("Grounding: the modification could not be classified against known culinary categories — effects are analyzed generically.")
  }

  return notes
}

export function suggestedCompensationGrounding(mod, _flags) {
  const category = mod.category
  const action = mod.action
  if (category === "sweetener" && (action === "remove" || action === "reduce")) {
    return [
      { targetProperty: "sweetness", action: "restore some sweetness via a denser sweetener or invert sugar at reduced proportion", confidence: "moderate" },
      { targetProperty: "moisture", action: "add moisture (syrup, fruit pur\u00e9e, or a small liquid increase) to offset drier crumb", confidence: "moderate" },
      { targetProperty: "browning", action: "compensate browning depth with a browned flavour agent (malt, toasted nuts, cocoa)", confidence: "moderate" },
    ]
  }
  if (category === "egg" && action === "remove") {
    return [
      { targetProperty: "binding", action: "introduce a plant binder (flax / cornstarch / potato starch blend)", confidence: "moderate" },
      { targetProperty: "aeration", action: "add a leavening or emulsifier step to recover lift", confidence: "low" },
      { targetProperty: "set", action: "add a thickening agent or cooling set (starch or gellan) for custard-era structure", confidence: "moderate" },
    ]
  }
  if (category === "fat" && (action === "remove" || action === "reduce")) {
    return [
      { targetProperty: "moisture", action: "increase liquid proportion or add fruit pur\u00e9e", confidence: "moderate" },
      { targetProperty: "richness", action: "accept reduced richness or add a brown-butter nuance at smaller scale", confidence: "moderate" },
    ]
  }
  if (category === "structure" && (action === "remove" || action === "reduce")) {
    return [
      { targetProperty: "structure", action: "strengthen binding (more egg or starch) and reduce leavening to compensate for weaker gluten", confidence: "moderate" },
    ]
  }
  return []
}

export function detectConflicts(mod, flags, _model = {}) {
  const conflicts = []
  const category = mod.category
  const action = mod.action

  if (category === "sweetener" && (action === "remove" || action === "reduce")) {
    if (has("foam", flags)) {
      conflicts.push({
        severity: "significant",
        message: "Sugar contributes structural support to this foam preparation. A large reduction risks deflation — compensate cautiously or state that stability cannot be guaranteed.",
      })
    } else if (has("structure", flags)) {
      conflicts.push({
        severity: "moderate",
        message: "Sugar supports tenderness and moisture in this baked structure. Reducing it may yield a denser or drier crumb unless compensated.",
      })
    }
  }

  if (category === "egg" && (action === "remove" || action === "reduce")) {
    if (has("foam", flags)) {
      conflicts.push({
        severity: "significant",
        message: "Eggs provide aeration in this preparation. Removing/reducing them without an alternative aerator will change volume and mouthfeel.",
      })
    }
    if (has("custard", flags)) {
      conflicts.push({
        severity: "significant",
        message: "Eggs set this custard/ganache. Removal changes set behaviour; a thickener or stabiliser must take over.",
      })
    }
  }

  if (category === "fat" && (action === "remove" || action === "reduce")) {
    if (has("structure", flags)) {
      conflicts.push({
        severity: "moderate",
        message: "Fats short the crumb in this baked item; reduction leads to a drier, less tender texture.",
      })
    }
  }

  if (category === "structure" && (action === "remove" || action === "reduce") && !has("egg", flags)) {
    conflicts.push({
      severity: "moderate",
      message: "Structure here relies almost entirely on starch/flour; reducing it without eggs present leaves little internal support.",
    })
  }

  return conflicts
}

export function deterministicDelta(model, mod, _flags) {
  if (mod.category !== "sweetener") return null
  if (!mod.pct || ![model.sensoryProfile?.sweetness, model.ingredients].some(Boolean)) return null
  const sugarIndex = (model.ingredients || []).findIndex((ing) => /sugar|sweetener|honey|syrup/.test(ing.name || "") && ing.amount != null)
  if (sugarIndex === -1) return null
  const base = model.ingredients[sugarIndex]
  const signed = (mod.action === "remove") ? -100 : (mod.action === "reduce" ? -mod.pct : null)
  if (signed == null) return null
  const modifiedAmount = Number((base.amount * (1 + signed / 100)).toFixed(2))
  return {
    ingredient: base.name,
    baseAmount: base.amount,
    baseUnit: base.unit,
    modifiedAmount,
    note: `${base.name}: ${base.amount}${base.unit || ""} \u2192 ~${modifiedAmount}${base.unit || ""} (${mod.action === "remove" ? "removed" : `~${mod.pct}% reduction`}). Exact recipe quantities are taken at face value from the ingredient list.`,
  }
}