import { useEffect, useState, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Download, FileText, Loader2, AlertTriangle,
  TrendingUp, TrendingDown, DollarSign, Layers, Building2,
  ChevronUp, ChevronDown, Minus, RefreshCw, IndianRupee, SlidersHorizontal,
  ShieldCheck, Database
} from 'lucide-react'
import toast from 'react-hot-toast'
import { generateReportHash } from '../services/reportHasher'
import { connectFreighter, anchorHashOnChain } from '../services/stellar'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

// Which roles use span × wall_height (surface area) vs plan area (bounding box)
const WALL_ROLES = new Set(['load_bearing', 'partition'])
const SLAB_ROLES = new Set(['slab'])

// Price database (₹ per m²) — mirrors backend
const MATERIAL_PRICES = {
  'AAC Blocks':            [800,  1200],
  'Red Brick':             [1000, 1500],
  'RCC':                   [2000, 3000],
  'Steel Frame':           [3500, 5500],
  'Hollow Concrete Block': [700,  1000],
  'Fly Ash Brick':         [850,  1200],
  'Precast Concrete Panel':[1800, 2800],
}
const DEFAULT_PRICE = [1000, 2000]

function getPrice(materialName) {
  if (MATERIAL_PRICES[materialName]) return MATERIAL_PRICES[materialName]
  for (const [key, val] of Object.entries(MATERIAL_PRICES)) {
    if (key.toLowerCase().includes(materialName.toLowerCase()) ||
        materialName.toLowerCase().includes(key.toLowerCase())) {
      return val
    }
  }
  return DEFAULT_PRICE
}

// Opening height is proportional to wall height:
// A door typically occupies ~70% of wall height, a window ~45%, generic ~60%
const OPENING_HEIGHT_RATIOS = {
  door:    0.70,   // e.g. 2.1m door in 3m wall
  window:  0.45,   // e.g. 1.35m window in 3m wall
  opening: 0.60,   // generic opening default
}

function getOpeningRatio(elementType) {
  const t = (elementType || '').toLowerCase()
  if (t.includes('door'))   return OPENING_HEIGHT_RATIOS.door
  if (t.includes('window')) return OPENING_HEIGHT_RATIOS.window
  return OPENING_HEIGHT_RATIOS.opening
}

/**
 * Compute effective area for an element given the current wall height.
 * Returns { area, formula } so the table can show the exact calculation.
 *
 * Walls    → span × wallHeight
 * Openings → span × (wallHeight × ratio)   ← scales with wall height
 * Slabs    → plan area from bbox (height irrelevant)
 * Others   → max(bbox area, minimum)
 */
function computeArea(analysis, wallHeightM) {
  const role = analysis.structural_role
  const span = analysis.span_estimate_m

  if (WALL_ROLES.has(role)) {
    const area = Math.max(span * wallHeightM, 0.5)
    return { area, formula: `${span}m × ${wallHeightM}m`, affectedByHeight: true }
  }

  if (role === 'opening') {
    const ratio     = getOpeningRatio(analysis.element_type)
    const openingH  = parseFloat((wallHeightM * ratio).toFixed(2))
    const area      = Math.max(span * openingH, 0.5)
    const pct       = Math.round(ratio * 100)
    return {
      area,
      formula: `${span}m × ${openingH}m (${pct}% of ${wallHeightM}m wall)`,
      affectedByHeight: true,
    }
  }

  if (SLAB_ROLES.has(role)) {
    const area = Math.max(analysis.area_estimate_m2, 0.5)
    return { area, formula: `${area}m² (plan area)`, affectedByHeight: false }
  }

  // columns, unknown
  const minArea = role === 'column' ? 1.5 : 0.5
  const area = Math.max(analysis.area_estimate_m2, minArea)
  return { area, formula: `${area}m² (footprint)`, affectedByHeight: false }
}

/**
 * Compute all line items from element_analyses + current wallHeight.
 * Pure frontend calculation — instant, no API call.
 */
function computeLineItems(elementAnalyses, wallHeightM) {
  return elementAnalyses.map(analysis => {
    const top = analysis.ranked_materials?.[0]
    if (!top) return null
    const [priceLow, priceHigh] = getPrice(top.name)
    const priceMid = (priceLow + priceHigh) / 2
    const { area: rawArea, formula, affectedByHeight } = computeArea(analysis, wallHeightM)
    const area = parseFloat(rawArea.toFixed(2))
    return {
      element_id:            analysis.element_id,
      element_type:          analysis.element_type,
      structural_role:       analysis.structural_role,
      recommended_material:  top.name,
      cost_tier:             top.cost,
      area_m2:               area,
      area_formula:          formula,
      affected_by_height:    affectedByHeight,
      unit_cost_low:         priceLow,
      unit_cost_high:        priceHigh,
      total_cost_low:        parseFloat((area * priceLow).toFixed(0)),
      total_cost_mid:        parseFloat((area * priceMid).toFixed(0)),
      total_cost_high:       parseFloat((area * priceHigh).toFixed(0)),
      span_m:                analysis.span_estimate_m,
      concerns:              analysis.structural_concerns || [],
    }
  }).filter(Boolean)
}

/**
 * Aggregate line items into category subtotals + grand totals.
 */
const ROLE_LABELS = {
  load_bearing: 'Load-Bearing Walls',
  partition:    'Partition Walls',
  column:       'Columns & Pillars',
  slab:         'Slabs & Beams',
  opening:      'Doors & Windows',
  unknown:      'Other Elements',
}

function computeSummary(lineItems) {
  const buckets = {}
  let grandLow = 0, grandMid = 0, grandHigh = 0, grandArea = 0

  for (const item of lineItems) {
    const role = item.structural_role
    if (!buckets[role]) buckets[role] = { items: [], low: 0, mid: 0, high: 0, area: 0 }
    buckets[role].items.push(item)
    buckets[role].low  += item.total_cost_low
    buckets[role].mid  += item.total_cost_mid
    buckets[role].high += item.total_cost_high
    buckets[role].area += item.area_m2
    grandLow  += item.total_cost_low
    grandMid  += item.total_cost_mid
    grandHigh += item.total_cost_high
    grandArea += item.area_m2
  }

  const categories = Object.entries(buckets).map(([role, b]) => ({
    structural_role: role,
    category: ROLE_LABELS[role] || role,
    element_count: b.items.length,
    total_area_m2: parseFloat(b.area.toFixed(2)),
    subtotal_low:  parseFloat(b.low.toFixed(0)),
    subtotal_mid:  parseFloat(b.mid.toFixed(0)),
    subtotal_high: parseFloat(b.high.toFixed(0)),
    percentage_of_total: grandMid > 0 ? parseFloat((b.mid / grandMid * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.subtotal_mid - a.subtotal_mid)

  return {
    categories,
    grandLow:  parseFloat(grandLow.toFixed(0)),
    grandMid:  parseFloat(grandMid.toFixed(0)),
    grandHigh: parseFloat(grandHigh.toFixed(0)),
    grandArea: parseFloat(grandArea.toFixed(2)),
    avgCostPerSqm: grandArea > 0 ? parseFloat((grandMid / grandArea).toFixed(0)) : 0,
  }
}

// ─── ROLE COLORS ─────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  load_bearing: { bg: 'bg-red-500',    text: 'text-white' },
  partition:    { bg: 'bg-blue-500',   text: 'text-white' },
  column:       { bg: 'bg-amber-500',  text: 'text-black' },
  opening:      { bg: 'bg-green-500',  text: 'text-white' },
  slab:         { bg: 'bg-purple-500', text: 'text-white' },
  unknown:      { bg: 'bg-gray-400',   text: 'text-white' },
}

// ─── Wall Height Slider ───────────────────────────────────────────────────────
function WallHeightControl({ wallHeight, onChange }) {
  return (
    <div className="voxel-panel bg-white p-5 flex flex-col gap-3 border-4 border-black shadow-[4px_4px_0_0_#fbbf24]">
      <div className="flex items-center gap-2 border-b-4 border-black pb-3">
        <SlidersHorizontal className="w-5 h-5 text-black" strokeWidth={2.5} />
        <h3 className="font-black text-black pixel-text uppercase tracking-widest text-sm">
          Wall Height
        </h3>
        <span className="ml-auto text-2xl font-black text-black pixel-text">{wallHeight}m</span>
      </div>

      <input
        type="range"
        min="1"
        max="10"
        step="0.5"
        value={wallHeight}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-4 bg-black rounded-none appearance-none cursor-pointer accent-yellow-400"
      />

      <div className="flex justify-between text-xs font-black pixel-text uppercase text-gray-500">
        <span>1m</span>
        <span>5m (typical)</span>
        <span>10m</span>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-400 p-2 text-xs font-bold text-yellow-800">
        ⚡ Costs update live — wall area = span × {wallHeight}m height.
        Slabs and openings are unaffected.
      </div>
    </div>
  )
}

// ─── Scenario Badge ───────────────────────────────────────────────────────────
function ScenarioBadge({ label, value, scenario }) {
  const configs = {
    low:  { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', icon: TrendingDown },
    mid:  { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800', icon: Minus },
    high: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800', icon: TrendingUp },
  }
  const cfg = configs[scenario]
  const Icon = cfg.icon
  return (
    <div className={`flex flex-col items-center p-4 border-4 ${cfg.border} ${cfg.bg} shadow-[3px_3px_0_0_#000]`}>
      <Icon className={`w-5 h-5 mb-1 ${cfg.text}`} />
      <span className={`text-xs font-black pixel-text uppercase tracking-widest ${cfg.text}`}>{label}</span>
      <span className={`text-2xl font-black pixel-text mt-1 ${cfg.text}`}>{fmt(value)}</span>
    </div>
  )
}

// ─── Category Card ─────────────────────────────────────────────────────────────
function CategoryCard({ cat, idx }) {
  const pct = cat.percentage_of_total || 0
  const colors = Object.values(ROLE_COLORS)
  const color = colors[idx % colors.length]
  return (
    <div className="voxel-panel bg-white p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black pixel-text uppercase tracking-widest text-gray-500">{cat.category}</p>
          <p className="text-2xl font-black text-black pixel-text mt-1">{fmt(cat.subtotal_mid)}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-black pixel-text uppercase border-4 border-black shadow-[2px_2px_0_0_#000] ${color.bg} ${color.text}`}>
          {pct}%
        </span>
      </div>
      <div className="w-full bg-gray-200 border-2 border-black h-3">
        <motion.div
          className={`h-full ${color.bg}`}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <div className="flex justify-between text-xs font-bold text-gray-500 pixel-text uppercase">
        <span>{cat.element_count} elements</span>
        <span>{cat.total_area_m2}m²</span>
      </div>
      <div className="flex gap-1 text-xs">
        <span className="font-bold text-green-700">{fmt(cat.subtotal_low)}</span>
        <span className="text-gray-400">–</span>
        <span className="font-bold text-red-700">{fmt(cat.subtotal_high)}</span>
      </div>
    </div>
  )
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────
function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <Minus className="w-3 h-3 text-gray-400" />
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-black" />
    : <ChevronDown className="w-3 h-3 text-black" />
}

// ─── Line Item Table ──────────────────────────────────────────────────────────
function LineItemTable({ lineItems, wallHeight }) {
  const [sortField, setSortField] = useState('total_cost_mid')
  const [sortDir, setSortDir]     = useState('desc')

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const sorted = [...lineItems].sort((a, b) => {
    const av = a[sortField], bv = b[sortField]
    const diff = typeof av === 'string' ? av.localeCompare(bv) : av - bv
    return sortDir === 'asc' ? diff : -diff
  })

  const COLS = [
    { key: 'element_id',           label: 'Element',       sortable: true },
    { key: 'element_type',         label: 'Type',          sortable: true },
    { key: 'structural_role',      label: 'Role',          sortable: true },
    { key: 'recommended_material', label: 'Material',      sortable: true },
    { key: 'span_m',               label: 'Span (m)',      sortable: true },
    { key: 'area_m2',              label: 'Area (m²)',     sortable: true },
    { key: 'unit_cost_low',        label: '₹/m² Low',      sortable: false },
    { key: 'unit_cost_high',       label: '₹/m² High',     sortable: false },
    { key: 'total_cost_mid',       label: 'Total (Mid)',   sortable: true },
  ]

  return (
    <div className="overflow-x-auto border-4 border-black shadow-[6px_6px_0_0_#000]">
      <table className="w-full text-sm font-bold border-collapse">
        <thead>
          <tr className="bg-black text-yellow-400">
            {COLS.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && toggleSort(col.key)}
                className={`px-3 py-3 text-left pixel-text uppercase tracking-widest text-xs border-r border-yellow-400/30 last:border-r-0 select-none ${col.sortable ? 'cursor-pointer hover:bg-yellow-400/10 transition-colors' : ''}`}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, idx) => {
            const roleColor = ROLE_COLORS[item.structural_role] || ROLE_COLORS.unknown
            const isWall = WALL_ROLES.has(item.structural_role)
            return (
              <tr
                key={item.element_id}
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b-2 border-black hover:bg-yellow-50 transition-colors`}
              >
                <td className="px-3 py-2 border-r-2 border-black font-black pixel-text text-xs text-gray-600">
                  {item.element_id}
                </td>
                <td className="px-3 py-2 border-r-2 border-black capitalize">{item.element_type}</td>
                <td className="px-3 py-2 border-r-2 border-black">
                  <span className={`px-2 py-0.5 text-xs font-black pixel-text uppercase border-2 border-black ${roleColor.bg} ${roleColor.text}`}>
                    {item.structural_role.replace('_', '-')}
                  </span>
                </td>
                <td className="px-3 py-2 border-r-2 border-black font-black">{item.recommended_material}</td>
                <td className="px-3 py-2 border-r-2 border-black text-right">{item.span_m}m</td>
                <td className="px-3 py-2 border-r-2 border-black text-right font-black">
                  <span className={item.affected_by_height ? 'text-blue-700' : ''}>
                    {item.area_m2}m²
                  </span>
                  {item.affected_by_height && (
                    <div className="text-xs text-blue-500 font-bold leading-tight mt-0.5">
                      {item.area_formula}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 border-r-2 border-black text-right text-green-700">{fmt(item.unit_cost_low)}</td>
                <td className="px-3 py-2 border-r-2 border-black text-right text-red-700">{fmt(item.unit_cost_high)}</td>
                <td className="px-3 py-2 text-right font-black text-black text-base">{fmt(item.total_cost_mid)}</td>
              </tr>
            )
          })}
          <tr className="bg-black text-yellow-400">
            <td colSpan={5} className="px-3 py-3 font-black pixel-text uppercase text-right border-r-2 border-yellow-400/30">
              TOTAL ({sorted.length} elements)
            </td>
            <td className="px-3 py-3 text-right border-r-2 border-yellow-400/30 font-black">
              {sorted.reduce((s, i) => s + i.area_m2, 0).toFixed(1)}m²
            </td>
            <td className="px-3 py-3 text-right border-r-2 border-yellow-400/30 text-green-400 font-black">—</td>
            <td className="px-3 py-3 text-right border-r-2 border-yellow-400/30 text-red-400 font-black">—</td>
            <td className="px-3 py-3 text-right font-black text-xl">
              {fmt(sorted.reduce((s, i) => s + i.total_cost_mid, 0))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── PDF Export ───────────────────────────────────────────────────────────────
async function exportPDF(reportRef, wallHeight, toast) {
  toast.loading('Generating PDF...')
  try {
    const { default: jsPDF }      = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')

    const canvas = await html2canvas(reportRef.current, {
      scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
    })
    const imgData  = canvas.toDataURL('image/png')
    const pdf      = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    const pageHeight = pdf.internal.pageSize.getHeight()
    let heightLeft = pdfHeight, position = 0

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight
    }
    const filename = `Structural_Cost_Report_H${wallHeight}m_${new Date().toISOString().slice(0, 10)}.pdf`
    pdf.save(filename)
    toast.dismiss()
    toast.success('PDF downloaded!')
  } catch (err) {
    toast.dismiss()
    window.print()
    toast.success('Opened print dialog as fallback.')
    console.error('PDF error:', err)
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CostBreakdownPage() {
  const navigate   = useNavigate()
  const reportRef  = useRef(null)

  const [analyses,      setAnalyses]      = useState(null)   // raw element_analyses
  const [structSummary, setStructSummary] = useState(null)
  const [wallHeight,    setWallHeight]    = useState(3)       // default 3m, same as VisualizationPage
  const [error,         setError]         = useState(null)
  const [isPdfExporting, setIsPdfExporting] = useState(false)
  const [isAnchoring, setIsAnchoring] = useState(false)
  const [txHash, setTxHash] = useState(null)
  const [showFreighterModal, setShowFreighterModal] = useState(false)

  // Load analyses from localStorage once
  useEffect(() => {
    const stored = localStorage.getItem('materialAnalysisResult')
    if (stored) {
      try {
        const result = JSON.parse(stored)
        if (result.element_analyses?.length > 0) {
          setAnalyses(result.element_analyses)
          setStructSummary(result.structural_summary || null)
          // Sync wall height from VisualizationPage if user saved it
          const savedHeight = localStorage.getItem('wallHeight')
          if (savedHeight) setWallHeight(parseFloat(savedHeight))
        } else {
          setError('No element analyses found. Please complete material analysis first.')
        }
      } catch {
        setError('Failed to load analysis data. Please run material analysis first.')
      }
    } else {
      setError('No analysis data found. Please complete the material analysis phase first.')
    }
  }, [])

  // Re-compute costs whenever wallHeight or analyses changes — pure JS, instant
  const lineItems = useMemo(
    () => analyses ? computeLineItems(analyses, wallHeight) : [],
    [analyses, wallHeight]
  )

  const summary = useMemo(() => computeSummary(lineItems), [lineItems])

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    setIsPdfExporting(true)
    await exportPDF(reportRef, wallHeight, toast)
    setIsPdfExporting(false)
  }

  const handleAnchorToBlockchain = async () => {
    if (!analyses) return
    
    setIsAnchoring(true)
    const toastId = toast.loading('Proof of Existence: Anchoring report to Stellar...')
    
    try {
      // 1. Generate Hash from current state
      const reportData = {
        projectId: `proj_${Date.now()}`, // In a real app, this would be fixed per project
        metadata: {
          timestamp: Date.now(),
          wallHeight: wallHeight,
          totalElements: lineItems.length,
          grandMid: summary.grandMid
        },
        lineItems: lineItems
      }
      const hash = await generateReportHash(reportData)
      
      // 2. Connect Wallet
      const publicKey = await connectFreighter()
      
      // 3. Anchor on Chain
      const result = await anchorHashOnChain(reportData.projectId, hash, summary.grandMid, publicKey)
      
      setTxHash(result)
      toast.success('Successfully anchored to Testnet!', { id: toastId })
    } catch (err) {
      console.error('Blockchain error:', err)
      if (err.message === 'Freighter wallet extension not found') {
        setShowFreighterModal(true)
        toast.dismiss(toastId)
      } else if (err.message.includes('denied') || err.message.includes('cancelled')) {
        toast.error('Transaction cancelled', { id: toastId })
      } else {
        toast.error(err.message || 'Failed to anchor report', { id: toastId })
      }
    } finally {
      setIsAnchoring(false)
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app/materials')}
              className="p-3 bg-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-black stroke-[3]" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-black pixel-text uppercase tracking-widest drop-shadow-md">
                Cost Breakdown
              </h1>
              <p className="text-black font-bold pixel-text uppercase tracking-wider opacity-80 text-sm">
                Live cost calculation · Wall height {wallHeight}m · PDF Export
              </p>
            </div>
          </div>

          {analyses && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleAnchorToBlockchain}
                disabled={isAnchoring}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black pixel-text uppercase text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAnchoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                Anchor to Blockchain
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isPdfExporting}
                id="export-pdf-btn"
                className="flex items-center gap-2 px-6 py-3 bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0_0_#fbbf24] hover:shadow-[2px_2px_0_0_#fbbf24] hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black pixel-text uppercase text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPdfExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export PDF
              </button>
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="voxel-panel bg-red-50 border-red-500 p-8 text-center"
          >
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" strokeWidth={2.5} />
            <h3 className="text-xl font-black text-red-600 pixel-text uppercase mb-2">Cannot Generate Report</h3>
            <p className="text-red-700 font-bold pixel-text mb-6">{error}</p>
            <button
              onClick={() => navigate('/app/materials')}
              className="bg-yellow-400 border-4 border-black text-black font-black uppercase px-8 py-3 pixel-text tracking-widest shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-all"
            >
              Go to Material Analysis
            </button>
          </motion.div>
        )}

        {/* ── Report ── */}
        {analyses && !error && (
          <div className="space-y-8">
            {txHash && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-100 border-4 border-green-600 p-4 mb-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-green-800 font-black pixel-text uppercase text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  Proof of Existence Anchored!
                </div>
                <div className="text-xs font-mono break-all text-green-700 bg-white/50 p-2 border-2 border-green-200">
                  Transaction Hash: {txHash}
                </div>
              </motion.div>
            )}

            {/* Wall Height Control — outside reportRef so it doesn't print */}
            <WallHeightControl wallHeight={wallHeight} onChange={setWallHeight} />

            {/* Everything below is captured in PDF */}
            <div ref={reportRef} className="space-y-8">

              {/* Report Header Banner */}
              <div className="bg-black border-4 border-black shadow-[8px_8px_0_0_#fbbf24] p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-8 h-8 text-yellow-400" />
                      <h2 className="text-2xl font-black text-yellow-400 pixel-text uppercase tracking-widest">
                        Structural Cost Estimate
                      </h2>
                    </div>
                    <p className="text-gray-400 font-bold pixel-text uppercase text-xs tracking-widest">
                      Wall Height: {wallHeight}m · {new Date().toLocaleDateString('en-IN')} · Currency: ₹ INR
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-4xl font-black text-yellow-400 pixel-text">{fmt(summary.grandMid)}</span>
                    <span className="text-gray-400 text-xs font-bold pixel-text uppercase">Mid-Range Total</span>
                  </div>
                </div>
              </div>

              {/* Grand Total Scenarios */}
              <section>
                <h2 className="text-lg font-black text-black pixel-text uppercase tracking-widest mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> Grand Total Scenarios
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ScenarioBadge label="Conservative (Low)" value={summary.grandLow}  scenario="low" />
                  <ScenarioBadge label="Realistic (Mid)"    value={summary.grandMid}  scenario="mid" />
                  <ScenarioBadge label="Premium (High)"     value={summary.grandHigh} scenario="high" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'Total Elements', value: lineItems.length },
                    { label: 'Total Area',     value: `${summary.grandArea} m²` },
                    { label: 'Avg ₹ / m²',     value: fmt(summary.avgCostPerSqm) },
                    { label: 'Wall Height',    value: `${wallHeight}m` },
                  ].map(({ label, value }) => (
                    <div key={label} className="border-4 border-black p-3 bg-white shadow-[3px_3px_0_0_#000] text-center">
                      <div className="text-xl font-black text-black pixel-text">{value}</div>
                      <div className="text-xs font-bold text-gray-500 pixel-text uppercase mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Category Breakdown */}
              <section>
                <h2 className="text-lg font-black text-black pixel-text uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5" /> Cost by Category
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summary.categories.map((cat, idx) => (
                    <CategoryCard key={cat.structural_role} cat={cat} idx={idx} />
                  ))}
                </div>
              </section>

              {/* Line Item Table */}
              <section>
                <h2 className="text-lg font-black text-black pixel-text uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" /> Line-Item Cost Estimate
                </h2>
                <p className="text-sm font-bold text-gray-600 pixel-text mb-4">
                  Areas shown in blue scale with wall height. Walls = Span × {wallHeight}m. 
                  Doors ≈ Span × {(wallHeight * 0.70).toFixed(2)}m (70% of wall). 
                  Windows ≈ Span × {(wallHeight * 0.45).toFixed(2)}m (45% of wall). Click headers to sort.
                </p>
                <LineItemTable lineItems={lineItems} wallHeight={wallHeight} />
              </section>

              {/* Notes */}
              <div className="border-4 border-black bg-gray-900 p-6 shadow-[4px_4px_0_0_#000]">
                <h3 className="text-yellow-400 font-black pixel-text uppercase tracking-widest mb-3 text-sm">
                  📋 Report Notes & Disclaimer
                </h3>
                <ul className="space-y-1.5 text-gray-300 text-sm font-bold">
                  <li>• <span className="text-blue-400">Walls</span>: Span (m) × {wallHeight}m height × ₹/m²</li>
                  <li>• <span className="text-blue-400">Doors</span>: Span × {(wallHeight * 0.70).toFixed(2)}m (70% × {wallHeight}m wall) × ₹/m²</li>
                  <li>• <span className="text-blue-400">Windows</span>: Span × {(wallHeight * 0.45).toFixed(2)}m (45% × {wallHeight}m wall) × ₹/m²</li>
                  <li>• <span className="text-gray-400">Slabs/Columns</span>: Plan area from detection (unchanged by height slider)</li>
                  <li>• All costs in Indian Rupees (₹) — material costs only, no labour included</li>
                  <li>• This report is AI-generated and should be reviewed by a qualified engineer</li>
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Freighter Installation Modal */}
      {showFreighterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFreighterModal(false)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white border-4 border-black p-8 max-w-md w-full shadow-[8px_8px_0_0_#000] text-center"
          >
            <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" strokeWidth={2.5} />
            <h3 className="text-2xl font-black pixel-text uppercase mb-4">Freighter Required</h3>
            <p className="text-gray-600 font-bold mb-8">
              To anchor this report to the blockchain for "Proof of Existence", you need the Freighter browser extension installed.
            </p>
            <div className="flex flex-col gap-3">
              <a 
                href="https://www.freighter.app/" 
                target="_blank" 
                rel="noreferrer"
                className="bg-yellow-400 border-4 border-black py-4 px-6 text-black font-black pixel-text uppercase tracking-widest hover:-translate-y-1 transition-all shadow-[4px_4px_0_0_#000]"
              >
                Install Freighter
              </a>
              <button 
                onClick={() => setShowFreighterModal(false)}
                className="font-black pixel-text uppercase text-sm text-gray-500 hover:text-black mt-2"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
