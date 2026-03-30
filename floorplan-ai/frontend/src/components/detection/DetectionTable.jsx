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
      className="voxel-panel"
    >
      <h2 className="text-2xl font-black text-black flex items-center gap-3 mb-6 pb-2 border-b-4 border-black pixel-text uppercase">
        <Table className="w-6 h-6 stroke-[3]" />
        Detection Details
      </h2>
      
      <div className="overflow-x-auto border-4 border-black">
        <table className="w-full bg-white">
          <thead className="bg-[#F5EAD4]">
            <tr className="border-b-4 border-black">
              <th className="text-left py-4 px-4 text-black font-black text-xl pixel-text uppercase border-r-4 border-black">#</th>
              <th className="text-left py-4 px-4 text-black font-black text-xl pixel-text uppercase border-r-4 border-black">Type</th>
              <th className="text-left py-4 px-4 text-black font-black text-xl pixel-text uppercase border-r-4 border-black">Confidence</th>
              <th className="text-left py-4 px-4 text-black font-black text-xl pixel-text uppercase border-r-4 border-black">Bounding Box</th>
              <th className="text-left py-4 px-4 text-black font-black text-xl pixel-text uppercase">Size</th>
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
                  className="border-b-4 border-black hover:bg-yellow-50 transition-colors"
                >
                  <td className="py-4 px-4 text-black font-black text-xl pixel-text border-r-4 border-black">
                    {index + 1}
                  </td>
                  <td className="py-4 px-4 border-r-4 border-black">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 border-2 border-black shadow-[2px_2px_0_0_#000]"
                        style={{ backgroundColor: detection.color }}
                      />
                      <span className="text-black uppercase font-black pixel-text text-xl">
                        {detection.classname}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 border-r-4 border-black">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-4 bg-black border-2 border-black relative">
                        <div 
                          className="absolute top-0 left-0 h-full bg-yellow-400 border-r-2 border-black"
                          style={{ width: `${detection.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xl text-black font-black pixel-text">
                        {(detection.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-black text-xl text-black pixel-text border-r-4 border-black">
                    [{detection.bbox.x1.toFixed(0)}, {detection.bbox.y1.toFixed(0)}, {detection.bbox.x2.toFixed(0)}, {detection.bbox.y2.toFixed(0)}]
                  </td>
                  <td className="py-4 px-4 flex items-center gap-1 font-black text-xl text-black pixel-text">
                    {width} <span className="text-sm">×</span> {height}
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
