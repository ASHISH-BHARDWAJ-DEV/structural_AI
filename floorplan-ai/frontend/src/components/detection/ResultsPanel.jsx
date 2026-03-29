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
      className="voxel-panel"
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b-4 border-black">
        <h2 className="text-2xl font-black text-black flex items-center gap-2 pixel-text uppercase">
          <ImageIcon className="w-6 h-6 stroke-[3]" />
          Detection Results
        </h2>
        
        <div className="flex gap-3">
          <button
            onClick={handleDownloadImage}
            className="px-4 py-2 bg-yellow-400 border-4 border-black text-black font-black uppercase pixel-text text-lg flex items-center gap-2 tracking-wider shadow-[2px_2px_0_0_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-[0px_0px_0_0_#000]"
          >
            <Download className="w-5 h-5 stroke-[3]" />
            Image
          </button>
          <button
            onClick={handleDownloadJSON}
            className="px-4 py-2 bg-yellow-400 border-4 border-black text-black font-black uppercase pixel-text text-lg flex items-center gap-2 tracking-wider shadow-[2px_2px_0_0_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-[0px_0px_0_0_#000]"
          >
            <Download className="w-5 h-5 stroke-[3]" />
            JSON
          </button>
        </div>
      </div>
      
      <div className="relative border-4 border-black bg-white shadow-inner">
        <img
          src={`data:image/png;base64,${detectionResult.annotated_image_base64}`}
          alt="Detected floor plan"
          className="w-full h-auto"
        />
      </div>
    </motion.div>
  )
}
