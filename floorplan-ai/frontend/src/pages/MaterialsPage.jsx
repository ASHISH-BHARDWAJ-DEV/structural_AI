import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, Loader2, FileText } from 'lucide-react'
import ElementSelector from '../components/materials/ElementSelector'
import MaterialRankingTable from '../components/materials/MaterialRankingTable'
import ExplainabilityCard from '../components/materials/ExplainabilityCard'
import { analyzeMaterials } from '../services/api'
import toast from 'react-hot-toast'

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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MaterialsPage() {
  const navigate = useNavigate()

  const [detectionData,      setDetectionData]      = useState(null)
  const [analysisResult,     setAnalysisResult]     = useState(null)
  const [isLoading,          setIsLoading]          = useState(false)
  const [error,              setError]              = useState(null)
  const [selectedElementId,  setSelectedElementId]  = useState(null)
  const [activeTab,          setActiveTab]          = useState('element')  // 'element' | 'overall'

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
        // Persist for CostBreakdownPage
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
                Phase 4+5 · Tradeoff Scoring · Gemini Explainability
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
              <button
                onClick={() => navigate('/app/cost-breakdown')}
                id="cost-report-btn"
                className="flex items-center gap-2 px-5 py-2 bg-yellow-400 border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black pixel-text uppercase text-sm text-black"
              >
                <FileText className="w-4 h-4" />
                Cost Report
                <ArrowRight className="w-4 h-4" />
              </button>
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

                  {/* Right: Material Ranking + Explainability */}
                  <div className="lg:col-span-3 space-y-6">
                    {selectedAnalysis ? (
                      <>
                        <MaterialRankingTable analysis={selectedAnalysis} />
                        <ExplainabilityCard analysis={selectedAnalysis} />
                      </>
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
                >
                  <ExplainabilityCard
                    overallExplanation={analysisResult.overall_explanation}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  )
}
