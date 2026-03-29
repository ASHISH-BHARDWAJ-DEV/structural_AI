import { motion } from 'framer-motion'

const COST_COLORS = {
  'Low':      'bg-green-400 text-black',
  'Low-Med':  'bg-lime-400 text-black',
  'Medium':   'bg-yellow-400 text-black',
  'Med-High': 'bg-orange-400 text-black',
  'High':     'bg-red-400 text-white',
}

const STRENGTH_COLORS = {
  'Low':       'bg-gray-300 text-black',
  'Medium':    'bg-blue-300 text-black',
  'Medium-High': 'bg-blue-400 text-black',
  'High':      'bg-blue-600 text-white',
  'Very High': 'bg-blue-800 text-white',
}

const DURABILITY_COLORS = {
  'Low':       'bg-gray-300 text-black',
  'Medium':    'bg-emerald-300 text-black',
  'High':      'bg-emerald-500 text-white',
  'Very High': 'bg-emerald-800 text-white',
}

function Badge({ label, colorClass }) {
  return (
    <span className={`text-xs font-black px-2 py-0.5 pixel-text uppercase border-2 border-black ${colorClass}`}>
      {label}
    </span>
  )
}

function ScoreBar({ label, value, maxValue = 100, color = 'bg-yellow-400' }) {
  const pct = Math.min(Math.round((value / maxValue) * 100), 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-black text-gray-600 pixel-text uppercase w-20 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-gray-200 border-2 border-black">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${color}`}
        />
      </div>
      <span className="text-xs font-black text-black pixel-text w-10 text-right">{value.toFixed(1)}</span>
    </div>
  )
}

export default function MaterialRankingTable({ analysis }) {
  if (!analysis || !analysis.ranked_materials?.length) {
    return (
      <div className="voxel-panel p-6 text-center">
        <p className="text-black font-bold pixel-text uppercase">No materials ranked</p>
      </div>
    )
  }

  const { ranked_materials, span_estimate_m, structural_role, element_type } = analysis

  return (
    <div className="voxel-panel bg-white p-6">
      <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-3">
        <h2 className="text-2xl font-black text-black pixel-text uppercase tracking-widest">
          Material Ranking
        </h2>
        <div className="flex gap-2">
          <span className="text-xs font-black px-2 py-1 bg-black text-yellow-400 pixel-text uppercase">
            {element_type}
          </span>
          <span className="text-xs font-black px-2 py-1 bg-gray-200 text-black pixel-text uppercase border-2 border-black">
            Span: {span_estimate_m}m
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {ranked_materials.map((mat, idx) => (
          <motion.div
            key={mat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`border-4 p-4 ${
              mat.is_recommended
                ? 'border-black bg-yellow-50 shadow-[4px_4px_0_0_#000]'
                : 'border-gray-300 bg-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`w-7 h-7 flex items-center justify-center font-black text-lg pixel-text border-4 border-black ${
                  idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-300' : 'bg-amber-700 text-white'
                }`}>
                  {idx + 1}
                </span>
                <span className="text-xl font-black text-black pixel-text">
                  {mat.name}
                </span>
                {mat.is_recommended && (
                  <span className="text-xs font-black px-2 py-0.5 bg-yellow-400 text-black pixel-text uppercase border-2 border-black shadow-[2px_2px_0_0_#000]">
                    ★ BEST PICK
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-black pixel-text leading-none">
                  {mat.score.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500 font-bold pixel-text uppercase">/ 100</div>
              </div>
            </div>

            {/* Property Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge label={`Cost: ${mat.cost}`}         colorClass={COST_COLORS[mat.cost] || 'bg-gray-200 text-black'} />
              <Badge label={`Str: ${mat.strength}`}      colorClass={STRENGTH_COLORS[mat.strength] || 'bg-gray-200 text-black'} />
              <Badge label={`Dur: ${mat.durability}`}    colorClass={DURABILITY_COLORS[mat.durability] || 'bg-gray-200 text-black'} />
            </div>

            {/* Score Breakdown Bars */}
            <div className="space-y-2">
              <ScoreBar label="Cost eff."  value={mat.cost_score}       color="bg-green-400" />
              <ScoreBar label="Strength"   value={mat.strength_score}   color="bg-blue-500"  />
              <ScoreBar label="Durability" value={mat.durability_score} color="bg-emerald-500" />
            </div>

            {/* Best Use */}
            <p className="mt-3 text-xs font-bold text-gray-500 pixel-text uppercase">
              Best use: {mat.best_use}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
