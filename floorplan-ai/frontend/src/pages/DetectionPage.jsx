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
      localStorage.setItem('detectionData', JSON.stringify(detectionResult.detection_json))
      navigate('/app/visualization')
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
          <h1 className="text-5xl font-bold text-black mb-4 pixel-text uppercase tracking-widest drop-shadow-md">
            Floor Plan Detection
          </h1>
          <p className="text-black/80 font-bold text-lg max-w-2xl mx-auto pixel-text tracking-widest uppercase">
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
              <button
                onClick={handleAnalyze}
                disabled={!uploadedFile || isDetecting}
                className="flex-1 bg-yellow-400 text-black border-4 border-black px-6 py-3 font-black uppercase pixel-text tracking-widest transition-transform hover:-translate-y-1 shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-[0px_0px_0_0_#000] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xl"
              >
                Analyze Floor Plan
              </button>
              
              <button
                onClick={handleReset}
                className="bg-white text-black border-4 border-black px-6 py-3 font-black uppercase pixel-text tracking-widest transition-transform hover:-translate-y-1 shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-[0px_0px_0_0_#000] flex items-center gap-2 text-xl"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    onClick={handleProceedTo3D}
                    className="w-full bg-yellow-400 text-black border-4 border-black px-6 py-4 font-black uppercase pixel-text tracking-[0.2em] transition-transform hover:-translate-y-1 shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-[0px_0px_0_0_#000] flex items-center justify-center gap-2 text-2xl"
                  >
                    Proceed to 3D Visualization
                    <ArrowRight className="w-6 h-6 stroke-[3]" />
                  </button>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="voxel-panel p-12 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-yellow-400 border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_#000]">
                  <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-black mb-2 pixel-text uppercase">No Results Yet</h3>
                <p className="text-black font-bold pixel-text text-lg">
                  Upload a floor plan and click "Analyze"
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
            className="mt-8 voxel-panel p-6 border-red-500 bg-red-50"
          >
            <h3 className="text-xl font-bold text-red-600 mb-2 pixel-text uppercase">Detection Error</h3>
            <p className="text-red-800 font-bold pixel-text text-lg">{detectionError}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
