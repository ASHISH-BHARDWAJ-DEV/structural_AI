import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, FileText, Brain, Sparkles, AlertCircle, AlertTriangle, Info,
  CheckCircle2, Ruler, Building2, ChevronDown, ChevronUp,
  HardHat, BarChart3, Zap, ShieldAlert
} from 'lucide-react'

// ─── Config ────────────────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  critical: {
    Icon: AlertCircle,
    bg: 'bg-red-950', border: 'border-red-500',
    text: 'text-red-300', badge: 'bg-red-500 text-white',
    label: 'CRITICAL', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.4)]',
  },
  warning: {
    Icon: AlertTriangle,
    bg: 'bg-yellow-950', border: 'border-yellow-500',
    text: 'text-yellow-300', badge: 'bg-yellow-400 text-black',
    label: 'WARNING', glow: 'shadow-[0_0_12px_rgba(234,179,8,0.3)]',
  },
  info: {
    Icon: Info,
    bg: 'bg-blue-950', border: 'border-blue-500',
    text: 'text-blue-300', badge: 'bg-blue-500 text-white',
    label: 'INFO', glow: '',
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

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parseStructuredSections(text) {
  if (!text) return null
  const sectionRegex = /\*\*([^*]+):\*\*\s*([\s\S]*?)(?=\*\*[^*]+:\*\*|$)/g
  const sections = []
  let match
  while ((match = sectionRegex.exec(text)) !== null) {
    const title = match[1].trim()
    const content = match[2].trim()
    if (title && content) sections.push({ title, content })
  }
  return sections.length >= 2 ? sections : null
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function GeomStat({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center border-4 border-black/50 p-4 bg-gray-800 shadow-[3px_3px_0_0_#fbbf2440] hover:shadow-[5px_5px_0_0_#fbbf2466] transition-all group">
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

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.07 }}
      className={`${cfg.bg} ${cfg.accent} border-4 border-black/40 shadow-[3px_3px_0_0_#000]`}
    >
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className={`flex items-center gap-2 text-xs font-black pixel-text uppercase tracking-widest px-2 py-1 border-2 border-black/30 ${cfg.tag}`}>
          <span>{cfg.emoji}</span>
          <span>{section.title}</span>
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
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

// ─── Single Element Explanation Card ──────────────────────────────────────────
function ElementExplanationCard({ analysis, isSelected, onClick }) {
  const sections = parseStructuredSections(analysis.explanation || '')
  const hasExpl = !!(analysis.explanation)
  const hasCritical = analysis.structural_concerns?.some(c => c.severity === 'critical')

  return (
    <motion.div
      layout
      className={`border-4 border-black shadow-[4px_4px_0_0_#000] overflow-hidden ${
        isSelected ? 'border-yellow-400' : ''
      }`}
    >
      {/* Card Header */}
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
          isSelected ? 'bg-yellow-400' : 'bg-black hover:bg-gray-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 border-4 border-black flex items-center justify-center font-black pixel-text text-sm ${
            isSelected ? 'bg-black text-yellow-400' : 'bg-yellow-400 text-black'
          }`}>
            {analysis.element_id?.replace(/\D/g, '') || '?'}
          </div>
          <div>
            <p className={`font-black pixel-text uppercase text-sm tracking-widest ${isSelected ? 'text-black' : 'text-yellow-400'}`}>
              {analysis.element_type}
            </p>
            <p className={`text-xs font-bold pixel-text uppercase ${isSelected ? 'text-black/60' : 'text-gray-400'}`}>
              {analysis.structural_role?.replace('_', '-')} · Span: {analysis.span_estimate_m}m
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasCritical && (
            <span className="text-xs font-black px-2 py-0.5 bg-red-500 text-white pixel-text uppercase border-2 border-red-300">
              ⚠ CRIT
            </span>
          )}
          {isSelected
            ? <ChevronUp className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-gray-400'}`} />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {isSelected && (
          <motion.div
            key="exp-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-gray-950"
          >
            <div className="p-5 space-y-5">
              {/* Geometry Stats */}
              <div>
                <p className="text-xs font-black pixel-text uppercase tracking-widest text-gray-500 mb-3">
                  ▸ Measurements
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <GeomStat icon={Ruler}     label="Span"   value={`${analysis.span_estimate_m}m`} />
                  <GeomStat icon={Building2} label="Height" value={`${analysis.height_estimate_m}m`} />
                  <GeomStat icon={Ruler}     label="Area"   value={`${analysis.area_estimate_m2}m²`} />
                </div>
              </div>

              {/* AI Explanation */}
              <div>
                <p className="text-xs font-black pixel-text uppercase tracking-widest text-gray-500 mb-3">
                  ▸ AI Analysis
                </p>
                {sections ? (
                  <div className="space-y-3">
                    {sections.map((section, idx) => (
                      <StructuredSection key={idx} section={section} idx={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="border-4 border-yellow-400 bg-black p-5 shadow-[4px_4px_0_0_#fbbf2440]">
                    <p className="text-yellow-300 font-bold leading-relaxed text-sm">
                      {analysis.explanation || (
                        <span className="text-gray-500 italic">No explanation available for this element.</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Structural Concerns */}
              {analysis.structural_concerns?.length > 0 ? (
                <div>
                  <p className="text-xs font-black pixel-text uppercase tracking-widest text-gray-500 mb-3">
                    ▸ Structural Concerns
                  </p>
                  <div className="space-y-2">
                    {analysis.structural_concerns.map((c, i) => (
                      <ConcernAlert key={i} concern={c} idx={i} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 border-4 border-green-500 bg-green-950">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" strokeWidth={2.5} />
                  <span className="text-sm font-bold text-green-300 pixel-text uppercase">
                    No structural concerns detected
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Overall Panel ─────────────────────────────────────────────────────────────
function OverallPanel({ overallExplanation }) {
  const sections = parseStructuredSections(overallExplanation || '')

  return (
    <div className="border-4 border-black bg-gray-950 shadow-[8px_8px_0_0_#000] overflow-hidden">
      <div className="bg-yellow-400 border-b-4 border-black px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-black border-4 border-black flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-yellow-400" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-xl font-black text-black pixel-text uppercase tracking-widest">
            Overall Structural Assessment
          </h3>
          <p className="text-xs font-bold text-black/60 pixel-text uppercase tracking-wider">
            Full structure analysis · Gemini LLM
          </p>
        </div>
        {sections && (
          <span className="ml-auto flex items-center gap-1 text-xs font-black px-3 py-1.5 bg-black text-yellow-400 pixel-text uppercase border-2 border-black">
            <Sparkles className="w-3 h-3" />
            {sections.length} Sections
          </span>
        )}
      </div>
      <div className="p-6">
        {sections ? (
          <div className="space-y-3">
            {sections.map((section, idx) => (
              <StructuredSection key={idx} section={section} idx={idx} />
            ))}
          </div>
        ) : (
          <div className="border-4 border-yellow-400 bg-black p-5 shadow-[4px_4px_0_0_#fbbf2440]">
            <p className="text-yellow-300 font-bold leading-relaxed text-sm">
              {overallExplanation || (
                <span className="text-gray-500 italic">No overall explanation available.</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ExplainabilityPage() {
  const navigate = useNavigate()
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState(null)
  const [selectedElementId, setSelectedElementId] = useState(null)
  const [activeTab, setActiveTab] = useState('elements') // 'elements' | 'overall'

  useEffect(() => {
    const stored = localStorage.getItem('materialAnalysisResult')
    if (stored) {
      try {
        const result = JSON.parse(stored)
        setAnalysisResult(result)
        if (result.element_analyses?.length > 0) {
          setSelectedElementId(result.element_analyses[0].element_id)
        }
      } catch (e) {
        setError('Could not load analysis data. Please complete material analysis first.')
      }
    } else {
      setError('No analysis data found. Please complete material analysis first.')
    }
  }, [])

  const toggleElement = (id) => {
    setSelectedElementId(prev => prev === id ? null : id)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-16 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            {/* Previous Step Button */}
            <button
              onClick={() => navigate('/app/materials')}
              className="flex items-center gap-2 p-3 bg-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-black stroke-[3]" />
            </button>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-black pixel-text uppercase tracking-widest drop-shadow-md">
                Explainability
              </h1>
              <p className="text-black font-bold pixel-text uppercase tracking-wider opacity-70 text-sm">
                Phase 5 · AI-Generated Structural Reasoning · Gemini LLM
              </p>
            </div>
          </div>

          {/* Header Badge */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-black border-4 border-black shadow-[4px_4px_0_0_#7c3aed]">
              <Brain className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-black pixel-text uppercase text-sm">
                Gemini · Deep Analysis
              </span>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="voxel-panel bg-red-50 border-red-500 p-8 text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" strokeWidth={2.5} />
            <h3 className="text-xl font-black text-red-600 pixel-text uppercase mb-2">No Data</h3>
            <p className="text-red-700 font-bold pixel-text mb-6">{error}</p>
            <button
              onClick={() => navigate('/app/materials')}
              className="bg-yellow-400 border-4 border-black text-black font-black uppercase px-8 py-3 pixel-text tracking-widest shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-all"
            >
              ← Go to Material Analysis
            </button>
          </motion.div>
        )}

        {/* ── Main Content ── */}
        {analysisResult && !error && (
          <>
            {/* Tab Switch */}
            <div className="flex gap-0 mb-8 border-4 border-black w-fit">
              {[
                { key: 'elements', label: 'Per-Element' },
                { key: 'overall',  label: 'Overall Report' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 font-black pixel-text uppercase tracking-widest text-lg transition-colors ${
                    activeTab === tab.key
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── Per-Element Tab ── */}
              {activeTab === 'elements' && (
                <motion.div
                  key="elements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Top Banner */}
                  <div className="border-4 border-black bg-black p-4 mb-6 shadow-[6px_6px_0_0_#7c3aed] flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-400 border-4 border-yellow-300 flex items-center justify-center shrink-0">
                      <Brain className="w-7 h-7 text-black" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-yellow-400 font-black pixel-text uppercase tracking-widest text-lg leading-none">
                        AI Element Explanations
                      </p>
                      <p className="text-gray-400 text-xs font-bold pixel-text uppercase mt-1">
                        {analysisResult.element_analyses?.length || 0} elements · Click an element to expand its AI explanation
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-black px-3 py-1.5 bg-purple-700 text-white pixel-text uppercase border-2 border-purple-400 shadow-[2px_2px_0_0_#000]">
                      <Sparkles className="w-3 h-3" />
                      Gemini AI
                    </span>
                  </div>

                  {/* Accordion list */}
                  <div className="space-y-3">
                    {analysisResult.element_analyses?.map((analysis) => (
                      <ElementExplanationCard
                        key={analysis.element_id}
                        analysis={analysis}
                        isSelected={selectedElementId === analysis.element_id}
                        onClick={() => toggleElement(analysis.element_id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Overall Tab ── */}
              {activeTab === 'overall' && (
                <motion.div
                  key="overall"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {analysisResult.overall_explanation ? (
                    <OverallPanel overallExplanation={analysisResult.overall_explanation} />
                  ) : (
                    <div className="voxel-panel p-16 text-center bg-black border-black shadow-[6px_6px_0_0_#7c3aed]">
                      <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <p className="text-2xl font-black text-yellow-400 pixel-text uppercase">
                        No Overall Report
                      </p>
                      <p className="text-white/50 font-bold pixel-text uppercase text-sm mt-2">
                        Overall assessment was not generated · Check per-element explanations
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Footer + CTA ── */}
            <div className="mt-10 space-y-4">
              <div className="border-4 border-black bg-gray-900 px-6 py-4 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 pixel-text uppercase">
                  Phase 05 · Explainability · AI-Generated · Structural AI System
                </span>
                <span className="text-xs font-bold text-gray-600 pixel-text uppercase hidden sm:block">
                  For informational use only — verify with a licensed structural engineer
                </span>
              </div>
              <button
                onClick={() => navigate('/app/cost-breakdown')}
                id="to-cost-report-btn"
                className="w-full bg-black text-yellow-400 border-4 border-black px-6 py-4 font-black uppercase pixel-text tracking-[0.2em] transition-transform hover:-translate-y-1 shadow-[6px_6px_0_0_#fbbf24] active:translate-y-1 active:shadow-none flex items-center justify-center gap-3 text-2xl"
              >
                <FileText className="w-6 h-6 stroke-[3]" />
                Phase 6 · Cost Report
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
