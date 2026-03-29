import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, RotateCcw, ArrowRight, FlaskConical } from 'lucide-react'
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
      className="pt-24 pb-12 min-h-screen bg-[#80C8C6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Voxel Style */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/app/detection')}
              className="p-3 bg-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-black stroke-[3]" />
            </button>
            <div>
              <h1 className="text-5xl font-black text-black mb-2 pixel-text uppercase tracking-widest drop-shadow-md">
                3D Visualization
              </h1>
              <p className="text-black font-bold pixel-text uppercase tracking-wider opacity-80">
                Interactive 3D model from detection data
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <label className="bg-yellow-400 border-4 border-black text-black px-6 py-3 font-black uppercase pixel-text tracking-widest cursor-pointer shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center gap-3">
              <Upload className="w-5 h-5 stroke-[3]" />
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
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Controls Panel - Voxel Style */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="voxel-panel bg-white p-8"
            >
              <h2 className="text-2xl font-black text-black mb-6 pixel-text uppercase tracking-widest border-b-4 border-black pb-2">
                Controls
              </h2>
              
              <div className="space-y-8">
                {/* Wall Height Control */}
                <div>
                  <label className="text-sm font-black text-black pixel-text uppercase mb-3 block">
                    Wall Height: {wallHeight}m
                  </label>
                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={wallHeight}
                      onChange={(e) => {
                        const h = parseFloat(e.target.value)
                        setWallHeight(h)
                        localStorage.setItem('wallHeight', h)
                      }}
                      className="w-full h-4 bg-black rounded-none appearance-none cursor-pointer accent-yellow-400"
                    />
                  </div>
                </div>
                
                {/* Show Labels Toggle - Voxel Style */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-black pixel-text uppercase">Show Labels</span>
                  <button
                    onClick={() => setShowLabels(!showLabels)}
                    className={`w-16 h-8 border-4 border-black transition-colors shadow-[2px_2px_0_0_#000] ${
                      showLabels ? 'bg-yellow-400' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-black transform transition-transform mx-1 ${
                        showLabels ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <button
                  onClick={handleReset}
                  className="w-full bg-white border-4 border-black text-black font-black uppercase px-4 py-3 pixel-text tracking-widest hover:bg-gray-100 hover:-translate-y-1 shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5 stroke-[3]" />
                  Reset View
                </button>
              </div>
            </motion.div>
            
            {/* Stats - Voxel Style */}
            {detectionData && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="voxel-panel bg-white p-8"
              >
                <h2 className="text-2xl font-black text-black mb-6 pixel-text uppercase tracking-widest border-b-4 border-black pb-2">
                  Stats
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2">
                    <span className="text-black font-bold pixel-text uppercase">Elements</span>
                    <span className="text-black font-black pixel-text">
                      {detectionData.elements?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2">
                    <span className="text-black font-bold pixel-text uppercase">Resol.</span>
                    <span className="text-black font-black pixel-text">
                      {detectionData.image_dimensions?.width}x{detectionData.image_dimensions?.height}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Instructions - Voxel Style */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="voxel-panel bg-black text-white p-8 shadow-[6px_6px_0_0_#fbbf24]"
            >
              <h2 className="text-2xl font-black text-yellow-400 mb-6 pixel-text uppercase tracking-widest border-b-4 border-yellow-400 pb-2">
                HUD Guide
              </h2>
              <ul className="space-y-3 text-sm font-bold pixel-text uppercase tracking-wider">
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-400" /> Rotate: L-Click</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-400" /> Pan: R-Click</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-400" /> Zoom: Scroll</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-400" /> Reset: 2x Click</li>
              </ul>
            </motion.div>
          </div>
          
          {/* Main Monitor Viewport */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-[75vh] bg-black border-[12px] border-black shadow-[12px_12px_0_0_rgba(0,0,0,0.4)] relative overflow-hidden"
            >
              {/* Retro Monitor Glare Effect */}
              <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-gradient-to-tr from-transparent via-white to-transparent" />
              
              {detectionData ? (
                <ThreeScene 
                  detectionData={detectionData}
                  wallHeight={wallHeight}
                  showLabels={showLabels}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center p-12 border-4 border-dashed border-gray-700">
                    <div className="w-24 h-24 mx-auto mb-8 bg-black border-4 border-gray-700 flex items-center justify-center">
                      <Upload className="w-12 h-12 text-gray-700" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-700 mb-4 pixel-text uppercase tracking-widest">
                      SYSTEM: NO_DATA
                    </h3>
                    <button
                      onClick={() => navigate('/app/detection')}
                      className="bg-gray-800 border-4 border-gray-700 text-gray-600 font-black uppercase px-8 py-4 text-xl pixel-text tracking-widest cursor-not-allowed"
                    >
                      Initialize Link
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Proceed to Materials Button */}
            {detectionData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <button
                  onClick={() => navigate('/app/materials')}
                  className="w-full bg-black text-yellow-400 border-4 border-black px-6 py-4 font-black uppercase pixel-text tracking-[0.2em] transition-transform hover:-translate-y-1 shadow-[6px_6px_0_0_#fbbf24] active:translate-y-1 active:shadow-[0px_0px_0_0_#000] flex items-center justify-center gap-3 text-2xl"
                >
                  <FlaskConical className="w-6 h-6 stroke-[3]" />
                  Material Analysis &amp; Explainability
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
