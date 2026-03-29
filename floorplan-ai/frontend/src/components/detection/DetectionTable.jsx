import { motion } from 'framer-motion'
import { Table } from 'lucide-react'
import useDetectionStore from '../../store/detectionStore'

export default function DetectionTable() {
  const { detectionResult } = useDetectionStore()
  
  if (!detectionResult?.detections?.length) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
        <Table className="w-5 h-5 text-primary-400" />
        Detection Details
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">#</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Type</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Confidence</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Bounding Box</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Size</th>
            </tr>
          </thead>
          <tbody>
            {detectionResult.detections.map((detection, index) => {
              const width = (detection.bbox.x2 - detection.bbox.x1).toFixed(0)
              const height = (detection.bbox.y2 - detection.bbox.y1).toFixed(0)
              
              return (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-500 text-sm">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: detection.color }}
                      />
                      <span className="text-white capitalize font-medium">
                        {detection.classname}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${detection.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-300">
                        {(detection.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-sm text-slate-400">
                    [{detection.bbox.x1.toFixed(0)}, {detection.bbox.y1.toFixed(0)}, {detection.bbox.x2.toFixed(0)}, {detection.bbox.y2.toFixed(0)}]
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-400">
                    {width} × {height}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
