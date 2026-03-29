import { motion } from 'framer-motion'
import { AlertTriangle, Info, AlertCircle, Brain, Ruler, Building2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertCircle,
    bg:   'bg-red-100',
    border: 'border-red-600',
    text:   'text-red-700',
    badge:  'bg-red-600 text-white',
    label:  'CRITICAL',
  },
  warning: {
    icon: AlertTriangle,
    bg:   'bg-yellow-50',
    border: 'border-yellow-500',
    text:   'text-yellow-800',
    badge:  'bg-yellow-400 text-black',
    label:  'WARNING',
  },
  info: {
    icon: Info,
    bg:   'bg-blue-50',
    border: 'border-blue-400',
    text:   'text-blue-700',
    badge:  'bg-blue-400 text-white',
    label:  'INFO',
  },
}

// Section header configs
const SECTION_CONFIGS = {
  'Material Recommendation': {
    emoji: '🏗️',
    bg: 'bg-blue-900',
    accent: 'border-l-4 border-blue-400',
    label: 'text-blue-300',
  },
  'Cost vs Strength Tradeoff': {
    emoji: '⚖️',
    bg: 'bg-purple-900',
    accent: 'border-l-4 border-purple-400',
    label: 'text-purple-300',
  },
  'Structural Concerns': {
    emoji: '⚠️',
    bg: 'bg-red-900',
    accent: 'border-l-4 border-red-400',
    label: 'text-red-300',
  },
  'Builder Guidance': {
    emoji: '👷',
    bg: 'bg-green-900',
    accent: 'border-l-4 border-green-400',
    label: 'text-green-300',
  },
  'Overall Assessment': {
    emoji: '📊',
    bg: 'bg-gray-900',
    accent: 'border-l-4 border-yellow-400',
    label: 'text-yellow-300',
  },
  'Load Path Analysis': {
    emoji: '🔀',
    bg: 'bg-indigo-900',
    accent: 'border-l-4 border-indigo-400',
    label: 'text-indigo-300',
  },
  'Risk Summary': {
    emoji: '🚨',
    bg: 'bg-orange-900',
    accent: 'border-l-4 border-orange-400',
    label: 'text-orange-300',
  },
  'Key Recommendations': {
    emoji: '✅',
    bg: 'bg-teal-900',
    accent: 'border-l-4 border-teal-400',
    label: 'text-teal-300',
  },
}

/**
 * Parse Gemini's structured output into sections.
 * Looks for **SectionName:** ... pattern
 */
function parseStructuredSections(text) {
  if (!text) return null

  // Match **Header:** content blocks
  const sectionRegex = /\*\*([^*]+):\*\*\s*([\s\S]*?)(?=\*\*[^*]+:\*\*|$)/g
  const sections = []
  let match

  while ((match = sectionRegex.exec(text)) !== null) {
    const title = match[1].trim()
    const content = match[2].trim()
    if (title && content) {
      sections.push({ title, content })
    }
  }

  return sections.length >= 2 ? sections : null
}

function StructuredSection({ section, idx }) {
  const cfg = SECTION_CONFIGS[section.title] || {
    emoji: '📝',
    bg: 'bg-gray-800',
    accent: 'border-l-4 border-gray-400',
    label: 'text-gray-300',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className={`${cfg.bg} ${cfg.accent} p-4 rounded-r-lg`}
    >
      <div className={`text-xs font-black pixel-text uppercase tracking-widest mb-2 flex items-center gap-2 ${cfg.label}`}>
        <span>{cfg.emoji}</span>
        <span>{section.title}</span>
      </div>
      <p className="text-gray-100 font-medium leading-relaxed text-sm">
        {section.content}
      </p>
    </motion.div>
  )
}

function ConcernAlert({ concern, idx }) {
  const cfg = SEVERITY_CONFIG[concern.severity] || SEVERITY_CONFIG.info
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.08 }}
      className={`flex items-start gap-3 p-3 border-4 ${cfg.border} ${cfg.bg}`}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.text}`} strokeWidth={2.5} />
      <div>
        <span className={`text-xs font-black px-2 py-0.5 pixel-text uppercase mr-2 ${cfg.badge}`}>
          {cfg.label}
        </span>
        <span className={`text-sm font-bold ${cfg.text}`}>{concern.message}</span>
      </div>
    </motion.div>
  )
}

export default function ExplainabilityCard({ analysis, overallExplanation }) {
  const isOverall = !analysis
  const [collapsed, setCollapsed] = useState(false)

  const explanationText = analysis
    ? (analysis.explanation || '')
    : (overallExplanation || '')

  // Try to parse structured sections first
  const sections = parseStructuredSections(explanationText)

  return (
    <div className="voxel-panel bg-white p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 border-b-4 border-black pb-3">
        <div className="w-10 h-10 bg-black flex items-center justify-center border-4 border-black shadow-[2px_2px_0_0_#fbbf24]">
          <Brain className="w-6 h-6 text-yellow-400" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-black pixel-text uppercase tracking-widest">
            {isOverall ? 'Overall Assessment' : 'AI Explanation'}
          </h2>
          {sections && (
            <p className="text-xs font-bold text-gray-500 pixel-text uppercase tracking-wider mt-0.5">
              Gemini Deep Analysis · {sections.length} Sections
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {sections && (
            <span className="flex items-center gap-1 text-xs font-black px-2 py-1 bg-purple-600 text-white pixel-text uppercase">
              <Sparkles className="w-3 h-3" />
              Deep AI
            </span>
          )}
          {!isOverall && (
            <span className="text-xs font-black px-2 py-1 bg-black text-yellow-400 pixel-text uppercase">
              Gemini
            </span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1 hover:bg-gray-100 border-2 border-black transition-colors"
            title="Toggle explanation"
          >
            {collapsed
              ? <ChevronDown className="w-4 h-4 text-black" />
              : <ChevronUp className="w-4 h-4 text-black" />
            }
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Geometry Stats (per-element only) */}
          {analysis && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Ruler,     label: 'Span',   value: `${analysis.span_estimate_m}m`   },
                { icon: Building2, label: 'Height', value: `${analysis.height_estimate_m}m` },
                { icon: Ruler,     label: 'Area',   value: `${analysis.area_estimate_m2}m²` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col items-center justify-center border-4 border-black p-3 bg-gray-50 shadow-[2px_2px_0_0_#000]">
                  <Icon className="w-5 h-5 text-black mb-1" strokeWidth={2.5} />
                  <span className="text-xl font-black text-black pixel-text">{value}</span>
                  <span className="text-xs font-bold text-gray-500 pixel-text uppercase">{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Structured Sections (if Gemini returned structured output) */}
          {sections ? (
            <div className="space-y-3">
              {sections.map((section, idx) => (
                <StructuredSection key={idx} section={section} idx={idx} />
              ))}
            </div>
          ) : (
            /* Fallback: plain text block */
            <div className="border-4 border-black p-4 bg-black shadow-[4px_4px_0_0_#fbbf24]">
              <p className="text-yellow-400 font-bold leading-relaxed pixel-text text-base">
                {explanationText || 'Generating explanation...'}
              </p>
            </div>
          )}

          {/* Structural Concerns (per-element) */}
          {analysis && analysis.structural_concerns?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-black text-black pixel-text uppercase tracking-widest mb-2">
                Structural Concerns
              </h3>
              {analysis.structural_concerns.map((concern, i) => (
                <ConcernAlert key={i} concern={concern} idx={i} />
              ))}
            </div>
          )}

          {/* No concerns message */}
          {analysis && (!analysis.structural_concerns || analysis.structural_concerns.length === 0) && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border-4 border-green-500">
              <Info className="w-5 h-5 text-green-700" strokeWidth={2.5} />
              <span className="text-sm font-bold text-green-700">
                No structural concerns detected for this element.
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
