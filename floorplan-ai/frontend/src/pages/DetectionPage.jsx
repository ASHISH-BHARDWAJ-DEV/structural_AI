import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import UploadPanel from '../components/detection/UploadPanel'
import ThresholdSlider from '../components/detection/ThresholdSlider'
import ImagePreview from '../components/detection/ImagePreview'
import ResultsPanel from '../components/detection/ResultsPanel'
import DetectionCards from '../components/detection/DetectionCards'
import DetectionTable from '../components/detection/DetectionTable'
import LoadingOverlay from '../components/ui/LoadingOverlay'
import useDetectionStore from '../store/detectionStore'
import { detectFloorPlan } from '../services/api'
import { ArrowRight, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DetectionPage() {
  const navigate = useNavigate()
  const {
    uploadedFile,
    uploadedPreview,
    isDetecting,
    detectionResult,
    detectionError,
    confidenceThreshold,
    setDetecting,
    setDetectionResult,
    setDetectionError,
    reset,
  } = useDetectionStore()
  
  const handleAnalyze = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a floor plan image first')
      return
    }
    
    setDetecting(true)
    
    try {
      const result = await detectFloorPlan(uploadedFile, confidenceThreshold)
      
      if (result.success) {
        setDetectionResult(result)
        toast.success(`Detected ${result.summary?.total_objects || 0} objects!`)
      } else {
        throw new Error(result.message || 'Detection failed')
      }
    } catch (error) {
      console.error('Detection error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Detection failed'
      setDetectionError(errorMessage)
      toast.error(errorMessage)
    }
  }
  
  const handleProceedTo3D = () => {
    if (detectionResult?.detection_json) {
      // Store detection data for visualization page
      localStorage.setItem('detectionData', JSON.stringify(detectionResult.detection_json))
      navigate('/visualize')
    }
  }
  
  const handleReset = () => {
    reset()
    toast.success('Reset complete')
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-12 min-h-screen"
    >
      {isDetecting && <LoadingOverlay message="Analyzing floor plan..." />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Floor Plan Detection
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Upload your floor plan and let AI detect walls, doors, windows, and more
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Settings */}
          <div className="space-y-6">
            <UploadPanel />
            <ThresholdSlider />
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={!uploadedFile || isDetecting}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Floor Plan
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </motion.button>
            </motion.div>
            
            {/* Image Preview */}
            {uploadedPreview && <ImagePreview />}
          </div>
          
          {/* Right Column - Results */}
          <div className="space-y-6">
            {detectionResult ? (
              <>
                <ResultsPanel />
                <DetectionCards />
                
                {/* Proceed to 3D Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedTo3D}
                  className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4"
                >
                  Proceed to 3D Visualization
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-12 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                  <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Results Yet</h3>
                <p className="text-slate-400">
                  Upload a floor plan and click "Analyze" to see detection results
                </p>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Detection Table */}
        {detectionResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <DetectionTable />
          </motion.div>
        )}
        
        {/* Error Display */}
        {detectionError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 glass-card p-6 border-red-500/50"
          >
            <h3 className="text-lg font-semibold text-red-400 mb-2">Detection Error</h3>
            <p className="text-slate-400">{detectionError}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
