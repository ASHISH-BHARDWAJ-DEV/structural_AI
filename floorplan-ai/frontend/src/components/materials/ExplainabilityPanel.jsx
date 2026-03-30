import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, AlertCircle, AlertTriangle, Info, Ruler, Building2,
  Sparkles, ChevronDown, ChevronUp, Zap, ShieldAlert, CheckCircle2,
  HardHat, BarChart3
} from 'lucide-react'
import { useState } from 'react'

// ─── Config ────────────────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  critical: {
    Icon:   AlertCircle,
    bg:     'bg-red-950',
    border: 'border-red-500',
    text:   'text-red-300',
    badge:  'bg-red-500 text-white',
    label:  'CRITICAL',
    glow:   'shadow-[0_0_12px_rgba(239,68,68,0.4)]',
  },
  warning: {
    Icon:   AlertTriangle,
    bg:     'bg-yellow-950',
    border: 'border-yellow-500',
    text:   'text-yellow-300',
    badge:  'bg-yellow-400 text-black',
    label:  'WARNING',
    glow:   'shadow-[0_0_12px_rgba(234,179,8,0.3)]',
  },
  info: {
    Icon:   Info,
    bg:     'bg-blue-950',
    border: 'border-blue-500',
    text:   'text-blue-300',
    badge:  'bg-blue-500 text-white',
    label:  'INFO',
    glow:   '',
  },
}

const SECTION_CONFIGS = {
  'Material Recommendation': {
    emoji: '🏗️', Icon: HardHat,
    bg: 'bg-blue-950', accent: 'border-l-[5px] border-blue-400',
    label: 'text-blue-300', tag: 'bg-blue-900 text-blue-300',
  },
  'Cost vs Strength Tradeoff': {
    emoji: '⚖️', Icon: BarChart3,
    bg: 'bg-purple-950', accent: 'border-l-[5px] border-purple-400',
    label: 'text-purple-300', tag: 'bg-purple-900 text-purple-300',
  },
  'Structural Concerns': {
    emoji: '⚠️', Icon: ShieldAlert,
    bg: 'bg-red-950', accent: 'border-l-[5px] border-red-400',
    label: 'text-red-300', tag: 'bg-red-900 text-red-300',
  },
  'Builder Guidance': {
    emoji: '👷', Icon: HardHat,
    bg: 'bg-green-950', accent: 'border-l-[5px] border-green-400',
    label: 'text-green-300', tag: 'bg-green-900 text-green-300',
  },
  'Overall Assessment': {
    emoji: '📊', Icon: BarChart3,
    bg: 'bg-gray-900', accent: 'border-l-[5px] border-yellow-400',
    label: 'text-yellow-300', tag: 'bg-gray-800 text-yellow-400',
  },
  'Load Path Analysis': {
    emoji: '🔀', Icon: Zap,
    bg: 'bg-indigo-950', accent: 'border-l-[5px] border-indigo-400',
    label: 'text-indigo-300', tag: 'bg-indigo-900 text-indigo-300',
  },
  'Risk Summary': {
    emoji: '🚨', Icon: AlertTriangle,
    bg: 'bg-orange-950', accent: 'border-l-[5px] border-orange-400',
    label: 'text-orange-300', tag: 'bg-orange-900 text-orange-300',
  },
  'Key Recommendations': {
    emoji: '✅', Icon: CheckCircle2,
    bg: 'bg-teal-950', accent: 'border-l-[5px] border-teal-400',
    label: 'text-teal-300', tag: 'bg-teal-900 text-teal-300',
  },
}

// ─── Parsing ───────────────────────────────────────────────────────────────────
function parseStructuredSections(text) {
  if (!text) return null
  const sectionRegex = /\*\*([^*]+):\*\*\s*([\s\S]*?)(?=\*\*[^*]+:\*\*|$)/g
  const sections = []
  let match
  while ((match = sectionRegex.exec(text)) !== null) {
    const title   = match[1].trim()
    const content = match[2].trim()
    if (title && content) sections.push({ title, content })
  }
  return sections.length >= 2 ? sections : null
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function GeomStat({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center border-4 border-black/60 p-4 bg-gray-800 shadow-[3px_3px_0_0_rgba(251,191,36,0.4)] hover:shadow-[5px_5px_0_0_rgba(251,191,36,0.5)] transition-all group">
      <Icon className="w-5 h-5 text-yellow-400 mb-1 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
      <span className="text-2xl font-black text-white pixel-text">{value}</span>
      <span className="text-xs font-bold text-gray-400 pixel-text uppercase mt-0.5">{label}</span>
    </div>
  )
}

function StructuredSection({ section, idx }) {
  const [open, setOpen] = useState(true)
  const cfg = SECTION_CONFIGS[section.title] || {
    emoji: '📝', Icon: Info,
    bg: 'bg-gray-900', accent: 'border-l-[5px] border-gray-500',
    label: 'text-gray-300', tag: 'bg-gray-800 text-gray-300',
  }
  const SectionIcon = cfg.Icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.08 }}
      className={`${cfg.bg} ${cfg.accent} border-4 border-black/40 shadow-[3px_3px_0_0_#000]`}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-2 text-xs font-black pixel-text uppercase tracking-widest px-2 py-1 border-2 border-black/30 ${cfg.tag}`}>
            <span>{cfg.emoji}</span>
            <span>{section.title}</span>
          </span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />
        }
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className={`px-5 pb-5 font-medium leading-relaxed text-sm ${cfg.label} opacity-90`}>
              {section.content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ConcernAlert({ concern, idx }) {
  const cfg = SEVERITY_CONFIG[concern.severity] || SEVERITY_CONFIG.info
  const { Icon } = cfg

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.06 }}
      className={`flex items-start gap-4 p-4 border-4 ${cfg.bg} ${cfg.border} ${cfg.glow}`}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.text}`} strokeWidth={2.5} />
      <div>
        <span className={`inline-block text-xs font-black px-2 py-0.5 pixel-text uppercase mr-2 border-2 border-black/30 ${cfg.badge}`}>
          {cfg.label}
        </span>
        <span className={`text-sm font-bold ${cfg.text}`}>{concern.message}</span>
      </div>
    </motion.div>
  )
}

// ─── Main ExplainabilityPanel ──────────────────────────────────────────────────
export default function ExplainabilityPanel({ analysis, overallExplanation }) {
  const isOverall       = !analysis
  const explanationText = analysis
    ? (analysis.explanation || '')
    : (overallExplanation || '')

  const sections = parseStructuredSections(explanationText)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-4 border-black bg-gray-950 shadow-[8px_8px_0_0_#000] overflow-hidden"
    >
      {/* ── Top Banner ── */}
      <div className="bg-black border-b-4 border-yellow-400 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-400 border-4 border-yellow-300 flex items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,0.6)]">
            <Brain className="w-7 h-7 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-yellow-400 pixel-text uppercase tracking-widest leading-none">
              {isOverall ? 'Overall Assessment' : `AI Explanation`}
            </h3>
            <p className="text-xs font-bold text-gray-400 pixel-text uppercase tracking-wider mt-0.5">
              {isOverall
                ? 'Full structural report · Gemini LLM analysis'
                : `Element: ${analysis?.element_id || '—'} · Gemini LLM analysis`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sections && (
            <span className="flex items-center gap-1 text-xs font-black px-3 py-1.5 bg-purple-700 text-white pixel-text uppercase border-2 border-purple-400 shadow-[2px_2px_0_0_#000]">
              <Sparkles className="w-3 h-3" />
              Deep AI · {sections.length} sections
            </span>
          )}
          <span className="text-xs font-black px-3 py-1.5 bg-yellow-400 text-black pixel-text uppercase border-2 border-black shadow-[2px_2px_0_0_#000]">
            Gemini
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ── Geometry Stats (per-element) ── */}
        {analysis && (
          <div>
            <p className="text-xs font-black pixel-text uppercase tracking-widest text-gray-500 mb-3">
              ▸ Element Measurements
            </p>
            <div className="grid grid-cols-3 gap-3">
              <GeomStat icon={Ruler}     label="Span"   value={`${analysis.span_estimate_m}m`} />
              <GeomStat icon={Building2} label="Height" value={`${analysis.height_estimate_m}m`} />
              <GeomStat icon={Ruler}     label="Area"   value={`${analysis.area_estimate_m2}m²`} />
            </div>
          </div>
        )}

        {/* ── AI Sections ── */}
        {sections ? (
          <div>
            <p className="text-xs font-black pixel-text uppercase tracking-widest text-gray-500 mb-3">
              ▸ AI Analysis Breakdown
            </p>
            <div className="space-y-3">
              {sections.map((section, idx) => (
                <StructuredSection key={idx} section={section} idx={idx} />
              ))}
            </div>
          </div>
        ) : (
          /* Fallback: Plain text */
          <div>
            <p className="text-xs font-black pixel-text uppercase tracking-widest text-gray-500 mb-3">
              ▸ AI Explanation
            </p>
            <div className="border-4 border-yellow-400 bg-black p-5 shadow-[4px_4px_0_0_rgba(251,191,36,0.5)]">
              <p className="text-yellow-300 font-bold leading-relaxed text-sm">
                {explanationText || (
                  <span className="text-gray-500 italic">Generating explanation...</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* ── Structural Concerns (per-element) ── */}
        {analysis && analysis.structural_concerns?.length > 0 && (
          <div>
            <p className="text-xs font-black pixel-text uppercase tracking-widest text-gray-500 mb-3">
              ▸ Structural Concerns
            </p>
            <div className="space-y-2">
              {analysis.structural_concerns.map((concern, i) => (
                <ConcernAlert key={i} concern={concern} idx={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── No concerns ── */}
        {analysis && (!analysis.structural_concerns || analysis.structural_concerns.length === 0) && (
          <div className="flex items-center gap-3 p-4 border-4 border-green-500 bg-green-950 shadow-[3px_3px_0_0_#000]">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" strokeWidth={2.5} />
            <span className="text-sm font-bold text-green-300 pixel-text uppercase tracking-wide">
              No structural concerns detected for this element
            </span>
          </div>
        )}

      </div>

      {/* ── Footer Bar ── */}
      <div className="border-t-4 border-black bg-gray-900 px-6 py-3 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 pixel-text uppercase">
          Phase 05 · Explainability · AI-Generated
        </span>
        <span className="text-xs font-bold text-gray-600 pixel-text uppercase">
          For informational use only — verify with a licensed engineer
        </span>
      </div>
    </motion.div>
  )
}
