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
  door: 'bg-green-400',
  window: 'bg-blue-400',
  wall: 'bg-red-400',
  column: 'bg-yellow-400',
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
        className="col-span-2 voxel-panel bg-yellow-400 p-6 shadow-[6px_6px_0_0_#000]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-black font-black pixel-text uppercase text-sm tracking-widest">Total Detections</p>
            <p className="text-5xl font-black text-black pixel-text">{total}</p>
          </div>
          <div className="w-16 h-16 border-4 border-black bg-white flex items-center justify-center shadow-[4px_4px_0_0_#000]">
            <Grid3X3 className="w-8 h-8 text-black" />
          </div>
        </div>
      </motion.div>
      
      {/* Individual counts */}
      {Object.entries(counts).map(([className, count], index) => {
        const Icon = iconMap[className.toLowerCase()] || Square
        const bgColor = colorMap[className.toLowerCase()] || 'bg-gray-400'
        
        return (
          <motion.div
            key={className}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            className="voxel-panel bg-white p-4 shadow-[4px_4px_0_0_#000]"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 border-4 border-black ${bgColor} flex items-center justify-center shadow-[2px_2px_0_0_#000]`}>
                <Icon className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-2xl font-black text-black pixel-text">{count}</p>
                <p className="text-black font-bold pixel-text uppercase text-xs tracking-tighter">{className}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
