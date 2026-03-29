import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import useDetectionStore from '../../store/detectionStore'

export default function ImagePreview() {
  const { uploadedPreview } = useDetectionStore()
  
  if (!uploadedPreview) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6"
    >
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-primary-400" />
        Original Image
      </h2>
      
      <div className="relative rounded-xl overflow-hidden bg-black/20">
        <img
          src={uploadedPreview}
          alt="Uploaded floor plan"
          className="w-full h-auto max-h-80 object-contain"
        />
      </div>
    </motion.div>
  )
}
