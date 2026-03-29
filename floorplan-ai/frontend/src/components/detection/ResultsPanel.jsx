import { motion } from 'framer-motion'
import { ImageIcon, Download } from 'lucide-react'
import useDetectionStore from '../../store/detectionStore'

export default function ResultsPanel() {
  const { detectionResult } = useDetectionStore()
  
  if (!detectionResult?.annotated_image_base64) return null
  
  const handleDownloadImage = () => {
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${detectionResult.annotated_image_base64}`
    link.download = 'detected_floorplan.png'
    link.click()
  }
  
  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(detectionResult.detection_json, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'detection_data.json'
    link.click()
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-green-400" />
          Detection Results
        </h2>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadImage}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Image
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadJSON}
            className="px-3 py-1.5 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            JSON
          </motion.button>
        </div>
      </div>
      
      <div className="relative rounded-xl overflow-hidden bg-black/20">
        <img
          src={`data:image/png;base64,${detectionResult.annotated_image_base64}`}
          alt="Detected floor plan"
          className="w-full h-auto"
        />
      </div>
    </motion.div>
  )
}
