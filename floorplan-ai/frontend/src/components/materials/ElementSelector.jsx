import { motion } from 'framer-motion'

const ROLE_COLORS = {
  load_bearing: { bg: 'bg-red-500',    label: 'Load-Bearing',  text: 'text-white' },
  partition:    { bg: 'bg-blue-500',   label: 'Partition',     text: 'text-white' },
  slab:         { bg: 'bg-purple-500', label: 'Slab / Beam',   text: 'text-white' },
  column:       { bg: 'bg-amber-500',  label: 'Column',        text: 'text-black' },
  opening:      { bg: 'bg-green-500',  label: 'Opening',       text: 'text-white' },
  unknown:      { bg: 'bg-gray-500',   label: 'Unknown',       text: 'text-white' },
}

export default function ElementSelector({ analyses, selectedId, onSelect }) {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="voxel-panel p-6 text-center">
        <p className="text-black font-bold pixel-text uppercase text-lg">No Elements</p>
      </div>
    )
  }

  return (
    <div className="voxel-panel bg-white p-4">
      <h2 className="text-xl font-black text-black mb-4 pixel-text uppercase tracking-widest border-b-4 border-black pb-2">
        Elements ({analyses.length})
      </h2>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {analyses.map((analysis, idx) => {
          const roleInfo = ROLE_COLORS[analysis.structural_role] || ROLE_COLORS.unknown
          const isSelected = analysis.element_id === selectedId
          const topMat = analysis.ranked_materials?.[0]
          const hasCritical = analysis.structural_concerns?.some(c => c.severity === 'critical')

          return (
            <motion.button
              key={analysis.element_id}
              onClick={() => onSelect(analysis.element_id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left p-3 border-4 transition-all ${
                isSelected
                  ? 'bg-yellow-400 border-black shadow-[4px_4px_0_0_#000]'
                  : 'bg-white border-gray-300 hover:border-black hover:shadow-[2px_2px_0_0_#000]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2 py-0.5 ${roleInfo.bg} ${roleInfo.text} pixel-text uppercase`}>
                    {roleInfo.label}
                  </span>
                  {hasCritical && (
                    <span className="text-xs font-black px-2 py-0.5 bg-red-600 text-white pixel-text uppercase">
                      ⚠ CRITICAL
                    </span>
                  )}
                </div>
                <span className="text-xs font-black text-gray-500 pixel-text">#{idx + 1}</span>
              </div>
              <p className="font-black text-black pixel-text uppercase text-sm tracking-wide">
                {analysis.element_type}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-600 font-bold pixel-text">
                  Span: {analysis.span_estimate_m}m
                </span>
                {topMat && (
                  <span className="text-xs text-gray-600 font-bold pixel-text">
                    → {topMat.name}
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
