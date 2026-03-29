import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, RotateCcw, Download, Maximize2 } from 'lucide-react'
import ThreeScene from '../components/visualization/ThreeScene'

export default function VisualizationPage() {
  const navigate = useNavigate()
  const [detectionData, setDetectionData] = useState(null)
  const [wallHeight, setWallHeight] = useState(3)
  const [showLabels, setShowLabels] = useState(true)
  
  useEffect(() => {
    const stored = localStorage.getItem('detectionData')
    if (stored) {
      try {
        setDetectionData(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse detection data:', e)
      }
    }
  }, [])
  
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result)
          setDetectionData(json)
          localStorage.setItem('detectionData', JSON.stringify(json))
        } catch (error) {
          alert('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
  }
  
  const handleReset = () => {
    setWallHeight(3)
    setShowLabels(true)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20 pb-12 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/detect')}
              className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white">3D Visualization</h1>
              <p className="text-slate-400">Interactive 3D model from detection data</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <label className="btn-secondary flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Controls</h2>
              
              <div className="space-y-4">
                {/* Wall Height */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Wall Height: {wallHeight}m
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={wallHeight}
                    onChange={(e) => setWallHeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                               [&::-webkit-slider-thumb]:appearance-none
                               [&::-webkit-slider-thumb]:w-4
                               [&::-webkit-slider-thumb]:h-4
                               [&::-webkit-slider-thumb]:rounded-full
                               [&::-webkit-slider-thumb]:bg-primary-500
                               [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
                
                {/* Show Labels Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Show Labels</span>
                  <button
                    onClick={() => setShowLabels(!showLabels)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      showLabels ? 'bg-primary-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                        showLabels ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                
                <button
                  onClick={handleReset}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset View
                </button>
              </div>
            </motion.div>
            
            {/* Stats */}
            {detectionData && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold text-white mb-4">Stats</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elements</span>
                    <span className="text-white font-medium">
                      {detectionData.elements?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensions</span>
                    <span className="text-white font-medium">
                      {detectionData.image_dimensions?.width} × {detectionData.image_dimensions?.height}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Navigation</h2>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Left-click + drag to rotate</li>
                <li>• Right-click + drag to pan</li>
                <li>• Scroll to zoom</li>
                <li>• Double-click to reset</li>
              </ul>
            </motion.div>
          </div>
          
          {/* 3D Scene */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 h-[600px]"
            >
              {detectionData ? (
                <ThreeScene 
                  detectionData={detectionData}
                  wallHeight={wallHeight}
                  showLabels={showLabels}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                      <Upload className="w-12 h-12 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Data Loaded</h3>
                    <p className="text-slate-400 mb-4">
                      Upload a detection JSON file or run detection first
                    </p>
                    <button
                      onClick={() => navigate('/detect')}
                      className="btn-primary"
                    >
                      Go to Detection
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
