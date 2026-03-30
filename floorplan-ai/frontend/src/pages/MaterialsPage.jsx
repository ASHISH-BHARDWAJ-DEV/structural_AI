import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, Loader2, Brain, Building2, ChevronUp, ChevronDown, Info, CheckCircle2, XCircle } from 'lucide-react'
import ElementSelector from '../components/materials/ElementSelector'
import MaterialRankingTable from '../components/materials/MaterialRankingTable'
import { analyzeMaterials } from '../services/api'
import toast from 'react-hot-toast'
import { FLOOR_CONFIGS, getFloorConfig, FLOOR_MATERIAL_TIPS } from '../data/multiStorey'

// ─── Structural Summary Bar ────────────────────────────────────────────────────
function SummaryBar({ summary }) {
  if (!summary) return null
  const stats = [
    { label: 'Total',         value: summary.total_elements,    color: 'bg-black text-yellow-400' },
    { label: 'Load-Bearing',  value: summary.load_bearing_count, color: 'bg-red-500 text-white' },
    { label: 'Partitions',    value: summary.partition_count,   color: 'bg-blue-500 text-white' },
    { label: 'Columns',       value: summary.column_count,      color: 'bg-amber-500 text-black' },
    { label: 'Openings',      value: summary.opening_count,     color: 'bg-green-500 text-white' },
    { label: 'Max Span',      value: `${summary.max_span_m}m`,  color: 'bg-purple-500 text-white' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8"
    >
      {stats.map(({ label, value, color }) => (
        <div key={label} className={`border-4 border-black p-3 text-center shadow-[3px_3px_0_0_#000] ${color}`}>
          <div className="text-2xl font-black pixel-text leading-none">{value}</div>
          <div className="text-xs font-bold pixel-text uppercase mt-1">{label}</div>
        </div>
      ))}
    </motion.div>
  )
}

// ─── Floor Selector ────────────────────────────────────────────────────────────
function FloorSelector({ numFloors, onChange }) {
  return (
    <div className="border-4 border-black bg-white shadow-[6px_6px_0_0_#000] p-5 mb-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-4 border-black">
        <Building2 className="w-6 h-6 text-black" strokeWidth={2.5} />
        <div>
          <h3 className="font-black text-black pixel-text uppercase tracking-widest text-sm">Multi-Storey Configuration</h3>
          <p className="text-xs text-black/50 font-bold pixel-text uppercase">Select number of floors to update material &amp; cost projections</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {FLOOR_CONFIGS.map(cfg => (
          <button
            key={cfg.floors}
            onClick={() => onChange(cfg.floors)}
            className={`flex-1 min-w-[80px] px-4 py-3 border-4 border-black font-black pixel-text uppercase text-sm transition-all ${
              numFloors === cfg.floors
                ? 'bg-black text-yellow-400 shadow-none translate-x-0.5 translate-y-0.5'
                : 'bg-white text-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5'
            }`}
          >
            <div className="text-lg">{cfg.label}</div>
            <div className="text-xs opacity-70 mt-0.5">{cfg.floors} floor{cfg.floors > 1 ? 's' : ''}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Multi-Storey Requirements Panel ──────────────────────────────────────────
function MultiStoreyPanel({ numFloors }) {
  const cfg  = getFloorConfig(numFloors)
  const tips = FLOOR_MATERIAL_TIPS[numFloors] || {}
  if (numFloors === 1) return null

  const specItems = [
    { label: 'Concrete Grade',  value: cfg.concreteGrade,  icon: '🧱' },
    { label: 'Steel Grade',     value: cfg.steelGrade,     icon: '🔩' },
    { label: 'Column Size',     value: cfg.columnSize,     icon: '📐' },
    { label: 'Slab Thickness',  value: cfg.slabThickness,  icon: '⬛' },
    { label: 'Foundation Type', value: cfg.footingType,    icon: '⚓' },
  ]

  return (
    <motion.div
      key={numFloors}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-4 border-black bg-gray-900 shadow-[6px_6px_0_0_#fbbf24] p-5 mb-6"
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-yellow-400/30">
        <Info className="w-5 h-5 text-yellow-400" strokeWidth={2.5} />
        <h3 className="font-black text-yellow-400 pixel-text uppercase tracking-widest text-sm">
          {cfg.label} Structural Requirements (IS 456 / NBC 2016)
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {specItems.map(({ label, value, icon }) => (
          <div key={label} className="bg-black border-2 border-yellow-400/30 p-3 text-center">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-yellow-400 font-black pixel-text text-sm">{value}</div>
            <div className="text-gray-400 text-xs font-bold pixel-text uppercase mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 text-xs font-black pixel-text uppercase tracking-widest mb-2">Key Requirements</p>
          <ul className="space-y-1">
            {cfg.notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-300 font-bold">
                <span className="text-yellow-400 mt-0.5 shrink-0">▸</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-gray-400 text-xs font-black pixel-text uppercase tracking-widest mb-2">Material Advisory</p>
          {tips.preferred?.length > 0 && (
            <div className="mb-2">
              <p className="text-green-400 text-xs font-black pixel-text uppercase mb-1">✓ Preferred</p>
              <div className="flex flex-wrap gap-1">
                {tips.preferred.map(m => (
                  <span key={m} className="px-2 py-0.5 bg-green-900/50 border border-green-500/50 text-green-300 text-xs font-bold pixel-text">{m}</span>
                ))}
              </div>
            </div>
          )}
          {tips.avoid?.length > 0 && (
            <div>
              <p className="text-red-400 text-xs font-black pixel-text uppercase mb-1">✗ Not Recommended</p>
              <div className="flex flex-wrap gap-1">
                {tips.avoid.map(m => (
                  <span key={m} className="px-2 py-0.5 bg-red-900/50 border border-red-500/50 text-red-300 text-xs font-bold pixel-text">{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MaterialsPage() {
  const navigate = useNavigate()

  const [detectionData,      setDetectionData]      = useState(null)
  const [analysisResult,     setAnalysisResult]     = useState(null)
  const [isLoading,          setIsLoading]          = useState(false)
  const [error,              setError]              = useState(null)
  const [selectedElementId,  setSelectedElementId]  = useState(null)
  const [activeTab,          setActiveTab]          = useState('element')
  const [numFloors,          setNumFloors]          = useState(
    () => parseInt(localStorage.getItem('numFloors') || '1')
  )

  const handleFloorChange = (n) => {
    setNumFloors(n)
    localStorage.setItem('numFloors', String(n))
  }

  // Load detection data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('detectionData')
    if (stored) {
      try {
        setDetectionData(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse detection data:', e)
        setError('Could not load detection data. Please run detection first.')
      }
    } else {
      setError('No detection data found. Please complete floor plan detection first.')
    }
  }, [])

  // Auto-run analysis when detection data loads
  useEffect(() => {
    if (detectionData && !analysisResult && !isLoading) {
      runAnalysis(detectionData)
    }
  }, [detectionData])

  const runAnalysis = async (data) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await analyzeMaterials(data)
      if (result.success) {
        setAnalysisResult(result)
        // Persist for CostBreakdownPage & ExplainabilityPage
        localStorage.setItem('materialAnalysisResult', JSON.stringify(result))
        // Auto-select first element
        if (result.element_analyses?.length > 0) {
          setSelectedElementId(result.element_analyses[0].element_id)
        }
        toast.success(`Analyzed ${result.element_analyses?.length || 0} elements!`)
      } else {
        throw new Error(result.message || 'Analysis failed')
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Material analysis failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedAnalysis = analysisResult?.element_analyses?.find(
    a => a.element_id === selectedElementId
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-12 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app/visualization')}
              className="p-3 bg-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-black stroke-[3]" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-black pixel-text uppercase tracking-widest drop-shadow-md">
                Material Analysis
              </h1>
              <p className="text-black font-bold pixel-text uppercase tracking-wider opacity-80 text-sm">
                Phase 4 · Tradeoff Scoring · Ranked Material Options
              </p>
            </div>
          </div>

          {analysisResult && (
            <div className="flex items-center gap-3">
              {analysisResult.structural_summary?.critical_concerns > 0 ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500 border-4 border-black shadow-[4px_4px_0_0_#000]">
                  <AlertTriangle className="w-5 h-5 text-white stroke-[3]" />
                  <span className="text-white font-black pixel-text uppercase text-sm">
                    {analysisResult.structural_summary.critical_concerns} Critical
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500 border-4 border-black shadow-[4px_4px_0_0_#000]">
                  <CheckCircle className="w-5 h-5 text-white stroke-[3]" />
                  <span className="text-white font-black pixel-text uppercase text-sm">All Clear</span>
                </div>
              )}

            </div>
          )}
        </div>

        {/* ── Loading State ── */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-6"
          >
            <div className="w-20 h-20 bg-black border-4 border-black shadow-[6px_6px_0_0_#fbbf24] flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-black pixel-text uppercase tracking-widest">
                Analyzing Materials...
              </p>
              <p className="text-black/70 font-bold pixel-text uppercase text-sm mt-2">
                Running tradeoff scoring · Calling Gemini API
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Error State ── */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="voxel-panel bg-red-50 border-red-500 p-8 text-center mb-8"
          >
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" strokeWidth={2.5} />
            <h3 className="text-xl font-black text-red-600 pixel-text uppercase mb-2">Error</h3>
            <p className="text-red-700 font-bold pixel-text">{error}</p>
            <button
              onClick={() => navigate('/app/detection')}
              className="mt-6 bg-yellow-400 border-4 border-black text-black font-black uppercase px-6 py-3 pixel-text tracking-widest shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-all"
            >
              Go to Detection
            </button>
          </motion.div>
        )}

        {/* ── Results ── */}
        {analysisResult && !isLoading && (
          <>
            {/* Summary Stats Bar */}
            <SummaryBar summary={analysisResult.structural_summary} />

            {/* Multi-Storey Selector */}
            <FloorSelector numFloors={numFloors} onChange={handleFloorChange} />

            {/* Structural Requirements Panel (hidden for G only) */}
            <MultiStoreyPanel numFloors={numFloors} />

            {/* Tab Switch */}
            <div className="flex gap-0 mb-6 border-4 border-black w-fit">
              {[
                { key: 'element', label: 'Element Analysis' },
                { key: 'overall', label: 'Overall Assessment' },
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
              {activeTab === 'element' && (
                <motion.div
                  key="element"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid lg:grid-cols-4 gap-6"
                >
                  {/* Left: Element Selector */}
                  <div className="lg:col-span-1">
                    <ElementSelector
                      analyses={analysisResult.element_analyses}
                      selectedId={selectedElementId}
                      onSelect={setSelectedElementId}
                    />
                  </div>

                  {/* Right: Material Ranking */}
                  <div className="lg:col-span-3">
                    {selectedAnalysis ? (
                      <MaterialRankingTable analysis={selectedAnalysis} />
                    ) : (
                      <div className="voxel-panel p-12 text-center">
                        <p className="text-2xl font-black text-black pixel-text uppercase">
                          Select an element
                        </p>
                        <p className="text-black/60 font-bold pixel-text uppercase text-sm mt-2">
                          Click any element on the left to view its material analysis
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'overall' && (
                <motion.div
                  key="overall"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="voxel-panel p-8 text-center"
                >
                  <Brain className="w-12 h-12 text-black/30 mx-auto mb-3" />
                  <p className="text-xl font-black text-black pixel-text uppercase mb-2">
                    Overall Assessment
                  </p>
                  <p className="text-black/60 font-bold pixel-text uppercase text-sm">
                    View the full AI-generated structural report on the Explainability page
                  </p>
                  <button
                    onClick={() => navigate('/app/explainability')}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0_0_#fbbf24] hover:shadow-[2px_2px_0_0_#fbbf24] hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black pixel-text uppercase text-sm mx-auto"
                  >
                    <Brain className="w-4 h-4" />
                    Go to Explainability
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── CTA: Go to Explainability ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <button
                onClick={() => navigate('/app/explainability')}
                id="to-explainability-btn"
                className="w-full bg-black text-yellow-400 border-4 border-black px-6 py-4 font-black uppercase pixel-text tracking-[0.2em] transition-transform hover:-translate-y-1 shadow-[6px_6px_0_0_#fbbf24] active:translate-y-1 active:shadow-[0px_0px_0_0_#000] flex items-center justify-center gap-3 text-2xl"
              >
                <Brain className="w-6 h-6 stroke-[3]" />
                Phase 5 · Explainability
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  )
}
