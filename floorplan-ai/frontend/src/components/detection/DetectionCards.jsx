import { motion } from 'framer-motion'
import { DoorOpen, Square, Columns, Grid3X3 } from 'lucide-react'
import useDetectionStore from '../../store/detectionStore'

const iconMap = {
  door: DoorOpen,
  window: Square,
  wall: Grid3X3,
  column: Columns,
}

const colorMap = {
  door: 'from-green-500 to-emerald-500',
  window: 'from-blue-500 to-cyan-500',
  wall: 'from-red-500 to-orange-500',
  column: 'from-amber-500 to-yellow-500',
}

export default function DetectionCards() {
  const { detectionResult } = useDetectionStore()
  
  if (!detectionResult?.summary?.counts) return null
  
  const counts = detectionResult.summary.counts
  const total = detectionResult.summary.total_objects
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 gap-4"
    >
      {/* Total Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="col-span-2 glass-card p-6 bg-gradient-to-br from-primary-500/20 to-accent-500/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Total Detections</p>
            <p className="text-4xl font-bold text-white">{total}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
            <Grid3X3 className="w-8 h-8 text-white" />
          </div>
        </div>
      </motion.div>
      
      {/* Individual counts */}
      {Object.entries(counts).map(([className, count], index) => {
        const Icon = iconMap[className.toLowerCase()] || Square
        const gradient = colorMap[className.toLowerCase()] || 'from-slate-500 to-slate-600'
        
        return (
          <motion.div
            key={className}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-slate-400 text-sm capitalize">{className}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
