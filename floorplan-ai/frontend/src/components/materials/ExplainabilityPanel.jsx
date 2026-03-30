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
    bg:     'bg-white',
    border: 'border-red-600',
    text:   'text-red-700',
    badge:  'bg-red-600 text-white',
    label:  'CRITICAL_WARNING',
    glow:   'shadow-[4px_4px_0_0_#dc2626]',
  },
  warning: {
    Icon:   AlertTriangle,
    bg:     'bg-white',
    border: 'border-yellow-600',
    text:   'text-yellow-800',
    badge:  'bg-yellow-400 text-black',
    label:  'SYSTEM_WARNING',
    glow:   'shadow-[4px_4px_0_0_#ca8a04]',
  },
  info: {
    Icon:   Info,
    bg:     'bg-white',
    border: 'border-blue-600',
    text:   'text-blue-700',
    badge:  'bg-blue-400 text-black',
    label:  'ASSESSMENT_INFO',
    glow:   'shadow-[4px_4px_0_0_#2563eb]',
  },
}

const SECTION_CONFIGS = {
  'Material Recommendation': {
    emoji: '🏗️', Icon: HardHat,
    bg: 'bg-white', accent: 'border-l-[8px] border-blue-500',
    label: 'text-black', tag: 'bg-blue-100 text-blue-800 border-2 border-blue-400',
  },
  'Cost vs Strength Tradeoff': {
    emoji: '⚖️', Icon: BarChart3,
    bg: 'bg-white', accent: 'border-l-[8px] border-purple-500',
    label: 'text-black', tag: 'bg-purple-100 text-purple-800 border-2 border-purple-400',
  },
  'Structural Concerns': {
    emoji: '⚠️', Icon: ShieldAlert,
    bg: 'bg-white', accent: 'border-l-[8px] border-red-500',
    label: 'text-black', tag: 'bg-red-100 text-red-800 border-2 border-red-400',
  },
  'Builder Guidance': {
    emoji: '👷', Icon: HardHat,
    bg: 'bg-white', accent: 'border-l-[8px] border-green-500',
    label: 'text-black', tag: 'bg-green-100 text-green-800 border-2 border-green-400',
  },
  'Overall Assessment': {
    emoji: '📊', Icon: BarChart3,
    bg: 'bg-white', accent: 'border-l-[8px] border-yellow-500',
    label: 'text-black', tag: 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400',
  },
  'Load Path Analysis': {
    emoji: '🔀', Icon: Zap,
    bg: 'bg-white', accent: 'border-l-[8px] border-indigo-500',
    label: 'text-black', tag: 'bg-indigo-100 text-indigo-800 border-2 border-indigo-400',
  },
  'Risk Summary': {
    emoji: '🚨', Icon: AlertTriangle,
    bg: 'bg-white', accent: 'border-l-[8px] border-orange-500',
    label: 'text-black', tag: 'bg-orange-100 text-orange-800 border-2 border-orange-400',
  },
  'Key Recommendations': {
    emoji: '✅', Icon: CheckCircle2,
    bg: 'bg-white', accent: 'border-l-[8px] border-teal-500',
    label: 'text-black', tag: 'bg-teal-100 text-teal-800 border-2 border-teal-400',
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
    <div className="flex flex-col items-center justify-center border-4 border-black p-4 bg-white shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all group cursor-default">
      <Icon className="w-5 h-5 text-black mb-1 group-hover:scale-110 transition-transform" strokeWidth={3} />
      <span className="text-2xl font-black text-black pixel-text">{value}</span>
      <span className="text-xs font-black text-black pixel-text uppercase mt-0.5 tracking-tighter opacity-60">{label}</span>
    </div>
  )
}

function StructuredSection({ section, idx }) {
  const [open, setOpen] = useState(true)
  const cfg = SECTION_CONFIGS[section.title] || {
    emoji: '📝', Icon: Info,
    bg: 'bg-white', accent: 'border-l-[8px] border-black',
    label: 'text-black', tag: 'bg-white text-black border-2 border-black',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.08 }}
      className={`${cfg.bg} ${cfg.accent} border-4 border-black shadow-[4px_4px_0_0_#000] mb-4 overflow-hidden`}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-2 text-xs font-black pixel-text uppercase tracking-widest px-3 py-1.5 shadow-[2px_2px_0_0_#000] ${cfg.tag}`}>
            <span>{cfg.emoji}</span>
            <span>{section.title}</span>
          </span>
        </div>
        {open
          ? <ChevronUp className="w-5 h-5 text-black stroke-[3]" />
          : <ChevronDown className="w-5 h-5 text-black stroke-[3]" />
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
            <p className={`px-5 pb-5 font-bold leading-relaxed text-sm ${cfg.label} pixel-text uppercase tracking-wide border-t-2 border-black/10 pt-4 mt-2`}>
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
      className={`flex items-start gap-4 p-5 border-4 border-black ${cfg.bg} ${cfg.glow} mb-4`}
    >
      <div className={`p-2 border-2 border-black ${cfg.badge} shadow-[2px_2px_0_0_#000]`}>
        <Icon className="w-5 h-5" strokeWidth={3} />
      </div>
      <div>
        <span className={`inline-block text-xs font-black px-2 py-0.5 pixel-text uppercase mr-2 border-2 border-black/30 shadow-[1px_1px_0_0_#000] ${cfg.badge}`}>
          {cfg.label}
        </span>
        <p className={`text-sm font-black pixel-text uppercase tracking-wider mt-2 ${cfg.text}`}>{concern.message}</p>
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
      className="border-4 border-black bg-white shadow-[8px_8px_0_0_#000] overflow-hidden"
    >
      {/* ── Top Banner ── */}
      <div className="bg-yellow-400 border-b-4 border-black px-6 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-black border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_#fbbf24]">
            <Brain className="w-8 h-8 text-yellow-400" strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-black pixel-text uppercase tracking-widest leading-none">
              {isOverall ? 'Overall Assessment' : `AI Explanation`}
            </h3>
            <p className="text-xs font-black text-black/60 pixel-text uppercase tracking-wider mt-1.5 opacity-80">
              {isOverall
                ? 'FULL_STRUCTURAL_REPORT // GEMINI_LLM_V1'
                : `DEVICE: ${analysis?.element_id || 'UNKNOWN'} // STRUCTURAL_LOG`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-black px-4 py-2 bg-black text-white pixel-text uppercase border-2 border-black shadow-[3px_3px_0_0_#fbbf24]">
            Gemini
          </span>
        </div>
      </div>

      <div className="p-8 space-y-10">

        {/* ── Geometry Stats (per-element) ── */}
        {analysis && (
          <div>
            <p className="text-xs font-black pixel-text uppercase tracking-widest text-black/50 mb-4 border-b-2 border-black/10 pb-2">
              SYSTEM_METRICS
            </p>
            <div className="grid grid-cols-3 gap-4">
              <GeomStat icon={Ruler}     label="Span"   value={`${analysis.span_estimate_m}m`} />
              <GeomStat icon={Building2} label="Height" value={`${analysis.height_estimate_m}m`} />
              <GeomStat icon={Ruler}     label="Area"   value={`${analysis.area_estimate_m2}m²`} />
            </div>
          </div>
        )}

        {/* ── AI Sections ── */}
        <div>
          <p className="text-xs font-black pixel-text uppercase tracking-widest text-black/50 mb-4 border-b-2 border-black/10 pb-2">
            DETAILED_LOGS
          </p>
          {sections ? (
            <div className="space-y-2">
              {sections.map((section, idx) => (
                <StructuredSection key={idx} section={section} idx={idx} />
              ))}
            </div>
          ) : (
            /* Fallback: Plain text */
            <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#fbbf24]">
              <p className="text-black font-black pixel-text uppercase tracking-widest leading-relaxed text-sm">
                {explanationText || (
                  <span className="text-black/30 italic">INITIALIZING_EXPLANATION...</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* ── Structural Concerns (per-element) ── */}
        {analysis && analysis.structural_concerns?.length > 0 && (
          <div>
            <p className="text-xs font-black pixel-text uppercase tracking-widest text-black/50 mb-4 border-b-2 border-black/10 pb-2">
              WARNINGS_REPORTED
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
          <div className="flex items-center gap-4 p-5 border-4 border-black bg-green-400 shadow-[4px_4px_0_0_#000]">
            <CheckCircle2 className="w-8 h-8 text-black" strokeWidth={3} />
            <span className="text-lg font-black text-black pixel-text uppercase tracking-widest">
              NO_INTEGRITY_COMRPIMISE_DETECTED
            </span>
          </div>
        )}

      </div>

      {/* ── Footer Bar ── */}
      <div className="border-t-4 border-black bg-gray-100 px-8 py-5 flex items-center justify-between">
        <span className="text-sm font-black text-black opacity-50 pixel-text uppercase tracking-widest">
          REPORT_ID: 05-XPLAN · ENGIN_ONLY
        </span>
        <span className="text-xs font-black text-black opacity-40 pixel-text uppercase tracking-tighter">
          VERIFY_WITH_LICENSE_PROFESSIONAL
        </span>
      </div>
    </motion.div>
  )
}
