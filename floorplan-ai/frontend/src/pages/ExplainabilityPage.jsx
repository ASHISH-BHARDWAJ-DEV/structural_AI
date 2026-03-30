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
    bg: 'bg-white', border: 'border-red-600',
    text: 'text-red-700', badge: 'bg-red-600 text-white',
    label: 'CRITICAL', glow: 'shadow-[4px_4px_0_0_#dc2626]',
  },
  warning: {
    Icon: AlertTriangle,
    bg: 'bg-white', border: 'border-yellow-600',
    text: 'text-yellow-800', badge: 'bg-yellow-400 text-black',
    label: 'WARNING', glow: 'shadow-[4px_4px_0_0_#ca8a04]',
  },
  info: {
    Icon: Info,
    bg: 'bg-white', border: 'border-blue-600',
    text: 'text-blue-700', badge: 'bg-blue-400 text-black',
    label: 'INFO', glow: 'shadow-[4px_4px_0_0_#2563eb]',
  },
}

const SECTION_CONFIGS = {
  'Material Recommendation': {
    emoji: '🏗️', Icon: HardHat,
    bg: 'bg-white', accent: 'border-l-[8px] border-blue-500',
    label: 'text-black', tag: 'bg-blue-50 text-blue-800 border-2 border-blue-400',
  },
  'Cost vs Strength Tradeoff': {
    emoji: '⚖️', Icon: BarChart3,
    bg: 'bg-white', accent: 'border-l-[8px] border-purple-500',
    label: 'text-black', tag: 'bg-purple-50 text-purple-800 border-2 border-purple-400',
  },
  'Structural Concerns': {
    emoji: '⚠️', Icon: ShieldAlert,
    bg: 'bg-white', accent: 'border-l-[8px] border-red-500',
    label: 'text-black', tag: 'bg-red-50 text-red-800 border-2 border-red-400',
  },
  'Builder Guidance': {
    emoji: '👷', Icon: HardHat,
    bg: 'bg-white', accent: 'border-l-[8px] border-green-500',
    label: 'text-black', tag: 'bg-green-50 text-green-800 border-2 border-green-400',
  },
  'Overall Assessment': {
    emoji: '📊', Icon: BarChart3,
    bg: 'bg-white', accent: 'border-l-[8px] border-yellow-500',
    label: 'text-black', tag: 'bg-yellow-50 text-yellow-800 border-2 border-yellow-400',
  },
  'Load Path Analysis': {
    emoji: '🔀', Icon: Zap,
    bg: 'bg-white', accent: 'border-l-[8px] border-indigo-500',
    label: 'text-black', tag: 'bg-indigo-50 text-indigo-800 border-2 border-indigo-400',
  },
  'Risk Summary': {
    emoji: '🚨', Icon: AlertTriangle,
    bg: 'bg-white', accent: 'border-l-[8px] border-orange-500',
    label: 'text-black', tag: 'bg-orange-50 text-orange-800 border-2 border-orange-400',
  },
  'Key Recommendations': {
    emoji: '✅', Icon: CheckCircle2,
    bg: 'bg-white', accent: 'border-l-[8px] border-teal-500',
    label: 'text-black', tag: 'bg-teal-50 text-teal-800 border-2 border-teal-400',
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
    <div className="flex flex-col items-center justify-center border-4 border-black p-4 bg-white shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all group">
      <Icon className="w-5 h-5 text-black mb-1 group-hover:scale-110 transition-transform" strokeWidth={3} />
      <span className="text-2xl font-black text-black pixel-text">{value}</span>
      <span className="text-xs font-black text-black/50 pixel-text uppercase mt-0.5">{label}</span>
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
      transition={{ delay: idx * 0.07 }}
      className={`${cfg.bg} ${cfg.accent} border-4 border-black shadow-[4px_4px_0_0_#000] mb-4 overflow-hidden`}
    >
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className={`flex items-center gap-2 text-xs font-black pixel-text uppercase tracking-widest px-3 py-1.5 shadow-[2px_2px_0_0_#000] ${cfg.tag}`}>
          <span>{cfg.emoji}</span>
          <span>{section.title}</span>
        </span>
        {open
          ? <ChevronUp className="w-5 h-5 text-black stroke-[3]" />
          : <ChevronDown className="w-5 h-5 text-black stroke-[3]" />}
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
            <p className={`px-5 pb-5 font-black pixel-text leading-relaxed text-sm ${cfg.label} opacity-90 uppercase tracking-widest`}>
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
        <span className={`inline-block text-xs font-black px-2 py-0.5 pixel-text uppercase mr-2 border-2 border-black shadow-[2px_2px_0_0_#000] ${cfg.badge}`}>
          {cfg.label}
        </span>
        <span className={`text-sm font-black pixel-text uppercase tracking-widest block mt-2 ${cfg.text}`}>{concern.message}</span>
      </div>
    </motion.div>
  )
}

// ─── Single Element Explanation Card ──────────────────────────────────────────
function ElementExplanationCard({ analysis, isSelected, onClick }) {
  const sections = parseStructuredSections(analysis.explanation || '')
  const hasCritical = analysis.structural_concerns?.some(c => c.severity === 'critical')

  return (
    <motion.div
      layout
      className={`border-4 border-black shadow-[6px_6px_0_0_#000] overflow-hidden mb-4 ${
        isSelected ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-[#F5EAD4]' : ''
      }`}
    >
      {/* Card Header */}
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
          isSelected ? 'bg-yellow-400' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 border-4 border-black flex items-center justify-center font-black pixel-text text-xl shadow-[3px_3px_0_0_#000] ${
            isSelected ? 'bg-black text-yellow-400' : 'bg-yellow-400 text-black'
          }`}>
            {analysis.element_id?.replace(/\D/g, '') || '?'}
          </div>
          <div>
            <p className="font-black pixel-text uppercase text-lg tracking-widest text-black">
              {analysis.element_type}
            </p>
            <p className="text-xs font-black pixel-text uppercase text-black/60 tracking-tighter">
              {analysis.structural_role?.replace('_', '-')} · Span: {analysis.span_estimate_m}m
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasCritical && (
            <span className="text-xs font-black px-3 py-1 bg-red-600 text-white pixel-text uppercase border-4 border-black shadow-[2px_2px_0_0_#000]">
              SYSTEM_FAULT
            </span>
          )}
          {isSelected
            ? <ChevronUp className="w-6 h-6 text-black stroke-[3]" />
            : <ChevronDown className="w-6 h-6 text-black stroke-[3]" />}
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
            className="overflow-hidden bg-white border-t-4 border-black"
          >
            <div className="p-8 space-y-10">
              {/* Geometry Stats */}
              <div>
                <p className="text-xs font-black pixel-text uppercase tracking-widest text-black/50 mb-4 border-b-2 border-black/10 pb-2">
                  ▸ ELEMENT_METRICS
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <GeomStat icon={Ruler}     label="Span"   value={`${analysis.span_estimate_m}m`} />
                  <GeomStat icon={Building2} label="Height" value={`${analysis.height_estimate_m}m`} />
                  <GeomStat icon={Ruler}     label="Area"   value={`${analysis.area_estimate_m2}m²`} />
                </div>
              </div>

              {/* AI Explanation */}
              <div>
                <p className="text-xs font-black pixel-text uppercase tracking-widest text-black/50 mb-4 border-b-2 border-black/10 pb-2">
                  ▸ STRUCTURAL_LOGS
                </p>
                {sections ? (
                  <div className="space-y-4">
                    {sections.map((section, idx) => (
                      <StructuredSection key={idx} section={section} idx={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#fbbf24]">
                    <p className="text-black font-black pixel-text uppercase tracking-widest leading-relaxed text-sm">
                      {analysis.explanation || (
                        <span className="text-black/30 italic">NO_LOG_DATA_AVAILABLE...</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Structural Concerns */}
              {analysis.structural_concerns?.length > 0 ? (
                <div>
                  <p className="text-xs font-black pixel-text uppercase tracking-widest text-black/50 mb-4 border-b-2 border-black/10 pb-2">
                    ▸ HAZARD_REPORT
                  </p>
                  <div className="space-y-3">
                    {analysis.structural_concerns.map((c, i) => (
                      <ConcernAlert key={i} concern={c} idx={i} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-5 border-4 border-black bg-green-400 shadow-[4px_4px_0_0_#000]">
                  <CheckCircle2 className="w-8 h-8 text-black" strokeWidth={3} />
                  <span className="text-lg font-black text-black pixel-text uppercase tracking-widest">
                    SYSTEM_STABLE
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
    <div className="border-4 border-black bg-white shadow-[12px_12px_0_0_#000] overflow-hidden">
      <div className="bg-yellow-400 border-b-4 border-black px-8 py-8 flex items-center gap-5">
        <div className="w-16 h-16 bg-black border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_#fbbf24]">
          <BarChart3 className="w-8 h-8 text-yellow-400" strokeWidth={3} />
        </div>
        <div>
          <h3 className="text-3xl font-black text-black pixel-text uppercase tracking-widest leading-none">
            Overall Structural Assessment
          </h3>
          <p className="text-sm font-black text-black/60 pixel-text uppercase tracking-wider mt-2 opacity-80">
            STRAT_ANALYSIS_MOD_V3 // GEMINI_LLM_DEEPVIEW
          </p>
        </div>
        {sections && (
          <span className="ml-auto flex items-center gap-2 text-sm font-black px-5 py-2.5 bg-black text-yellow-400 pixel-text uppercase border-4 border-black shadow-[4px_4px_0_0_#fbbf24]">
            <Sparkles className="w-4 h-4" />
            {sections.length} ANALYTICS
          </span>
        )}
      </div>
      <div className="p-10">
        {sections ? (
          <div className="space-y-4">
            {sections.map((section, idx) => (
              <StructuredSection key={idx} section={section} idx={idx} />
            ))}
          </div>
        ) : (
          <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#fbbf24]">
            <p className="text-black font-black pixel-text uppercase tracking-[0.1em] leading-relaxed text-lg">
              {overallExplanation || (
                <span className="text-black/30 italic">INITIALIZING_GLOBAL_REPORT...</span>
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
      className="pt-24 pb-16 min-h-screen bg-[#F5EAD4]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-12 border-b-8 border-black pb-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/app/materials')}
              className="flex items-center gap-2 p-4 bg-white border-4 border-black shadow-[6px_6px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <ArrowLeft className="w-8 h-8 text-black stroke-[4]" />
            </button>
            <div>
              <h1 className="text-6xl font-black text-black pixel-text uppercase tracking-widest drop-shadow-md">
                EXPLAIN_PHASE
              </h1>
              <p className="text-black font-black pixel-text uppercase tracking-widest mt-2 opacity-60">
                REASONING_ENGINE_v42 // LLM_OVERVIEW
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-3 px-6 py-3 bg-black border-4 border-black shadow-[6px_6px_0_0_#fbbf24]">
              <Brain className="w-6 h-6 text-yellow-400" />
              <span className="text-yellow-400 font-black pixel-text uppercase text-lg tracking-widest">
                GEMINI_CORE_LINKED
              </span>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="voxel-panel bg-white border-red-600 p-12 text-center shadow-[12px_12px_0_0_#dc2626]"
          >
            <AlertCircle className="w-20 h-20 text-red-600 mx-auto mb-6" strokeWidth={3} />
            <h3 className="text-3xl font-black text-red-600 pixel-text uppercase mb-4">CRITICAL_FAULT: NO_DATA</h3>
            <p className="text-black font-black pixel-text text-xl mb-10 tracking-widest uppercase">{error}</p>
            <button
              onClick={() => navigate('/app/materials')}
              className="bg-yellow-400 border-4 border-black text-black font-black uppercase px-12 py-5 text-2xl pixel-text tracking-widest shadow-[8px_8px_0_0_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all"
            >
              RE-INITIALIZE
            </button>
          </motion.div>
        )}

        {/* ── Main Content ── */}
        {analysisResult && !error && (
          <>
            {/* Tab Switch */}
            <div className="flex gap-0 mb-12 border-8 border-black w-fit shadow-[8px_8px_0_0_#000]">
              {[
                { key: 'elements', label: 'PER_ELEMENT' },
                { key: 'overall',  label: 'GLOBAL_REPORT' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-10 py-5 font-black pixel-text uppercase tracking-[0.2em] text-2xl transition-colors ${
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Top Banner */}
                  <div className="border-4 border-black bg-black p-6 mb-10 shadow-[8px_8px_0_0_#7c3aed] flex items-center gap-6">
                    <div className="w-16 h-16 bg-yellow-400 border-4 border-yellow-300 flex items-center justify-center shrink-0 shadow-[4px_4px_0_0_#000]">
                      <Brain className="w-10 h-10 text-black" strokeWidth={3} />
                    </div>
                    <div className="flex-1">
                      <p className="text-yellow-400 font-black pixel-text uppercase tracking-[0.3em] text-2xl leading-none">
                        AI_REASONING_HUD
                      </p>
                      <p className="text-gray-400 text-xs font-black pixel-text uppercase tracking-widest mt-2">
                        {analysisResult.element_analyses?.length || 0} OBJECTS_FOUND // SELECT_TO_DECRYPT
                      </p>
                    </div>
                  </div>

                  {/* Accordion list */}
                  <div className="space-y-4">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {analysisResult.overall_explanation ? (
                    <OverallPanel overallExplanation={analysisResult.overall_explanation} />
                  ) : (
                    <div className="voxel-panel p-24 text-center bg-white border-black shadow-[12px_12px_0_0_#7c3aed]">
                      <Brain className="w-24 h-24 text-black opacity-20 mx-auto mb-8" />
                      <p className="text-4xl font-black text-black pixel-text uppercase tracking-widest">
                        ERROR: LOG_NOT_FOUND
                      </p>
                      <p className="text-black/40 font-black pixel-text uppercase text-lg mt-4 tracking-wider">
                        GLOBAL_REPORT_BUFFER_EMPTY // CHECK_PER_ELEMENT_STREAMS
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Footer + CTA ── */}
            <div className="mt-16 space-y-6">
              <div className="border-4 border-black bg-white px-8 py-6 flex items-center justify-between shadow-[6px_6px_0_0_#000]">
                <span className="text-sm font-black text-black opacity-40 pixel-text uppercase tracking-[0.2em]">
                  PHASE_05 // EXPLAIN_SYSTEM // SECURE_ARCH
                </span>
                <span className="text-sm font-black text-black opacity-40 pixel-text uppercase hidden sm:block tracking-widest">
                  AUTHORIZED_PERSONNEL_ONLY // DO_NOT_DISTRIBUTE
                </span>
              </div>
              <button
                onClick={() => navigate('/app/cost-breakdown')}
                className="w-full bg-yellow-400 text-black border-8 border-black px-10 py-8 font-black uppercase pixel-text tracking-[0.4em] transition-transform hover:-translate-y-2 shadow-[12px_12px_0_0_#000] active:translate-y-2 active:shadow-none flex items-center justify-center gap-6 text-4xl"
              >
                <FileText className="w-10 h-10 stroke-[4]" />
                PHASE_06: COST_REPORT
                <ArrowRight className="w-10 h-10 stroke-[4]" />
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
