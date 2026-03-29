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
      className="voxel-panel"
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b-4 border-black">
        <h2 className="text-2xl font-black text-black flex items-center gap-3 pixel-text uppercase">
          <SlidersHorizontal className="w-6 h-6 stroke-[3]" />
          Confidence Threshold
        </h2>
        <span className="text-3xl font-black text-black pixel-text bg-yellow-400 border-4 border-black px-3 py-1 shadow-[2px_2px_0_0_#000]">
          {Math.round(confidenceThreshold * 100)}%
        </span>
      </div>
      
      <div className="relative mt-8 mb-4">
        <input
          type="range"
          min="0"
          max="100"
          value={confidenceThreshold * 100}
          onChange={(e) => setConfidenceThreshold(e.target.value / 100)}
          className="w-full h-4 bg-black appearance-none cursor-pointer border-2 border-black
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-8
                     [&::-webkit-slider-thumb]:h-8
                     [&::-webkit-slider-thumb]:bg-yellow-400
                     [&::-webkit-slider-thumb]:border-4
                     [&::-webkit-slider-thumb]:border-black
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-[4px_4px_0_0_#000]
                     [&::-webkit-slider-thumb]:relative
                     [&::-webkit-slider-thumb]:z-10"
        />
        
        {/* Track fill */}
        <div 
          className="absolute top-0 left-0 h-4 bg-yellow-400 border-y-2 border-l-2 border-black pointer-events-none"
          style={{ width: `${confidenceThreshold * 100}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-4 text-lg font-black text-black pixel-text uppercase">
        <span>Less Strict</span>
        <span>More Strict</span>
      </div>
      
      <p className="text-black/70 font-bold pixel-text text-lg mt-4 text-center">
        Higher threshold = fewer but more confident detections
      </p>
    </motion.div>
  )
}
