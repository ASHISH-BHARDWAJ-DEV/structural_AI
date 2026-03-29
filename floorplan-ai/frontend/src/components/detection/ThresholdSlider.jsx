import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import useDetectionStore from '../../store/detectionStore'

export default function ThresholdSlider() {
  const { confidenceThreshold, setConfidenceThreshold } = useDetectionStore()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary-400" />
          Confidence Threshold
        </h2>
        <span className="text-2xl font-bold text-primary-400">
          {Math.round(confidenceThreshold * 100)}%
        </span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={confidenceThreshold * 100}
          onChange={(e) => setConfidenceThreshold(e.target.value / 100)}
          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-gradient-to-r
                     [&::-webkit-slider-thumb]:from-primary-500
                     [&::-webkit-slider-thumb]:to-accent-500
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-lg
                     [&::-webkit-slider-thumb]:shadow-primary-500/50"
        />
        
        {/* Track fill */}
        <div 
          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 pointer-events-none"
          style={{ width: `${confidenceThreshold * 100}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>Less strict</span>
        <span>More strict</span>
      </div>
      
      <p className="text-slate-400 text-sm mt-4">
        Higher threshold = fewer but more confident detections
      </p>
    </motion.div>
  )
}
