import { motion } from 'framer-motion'
import { Scan, Shapes, Box, Palette, Brain, CheckCircle2 } from 'lucide-react'

const stages = [
  {
    icon: Scan,
    title: 'Floor Plan Parsing',
    description: 'AI detects walls, doors, windows, and architectural elements from uploaded images.',
    status: 'active',
    color: 'bg-green-400',
  },
  {
    icon: Shapes,
    title: 'Geometry Reconstruction',
    description: 'Convert detected elements into precise geometric shapes and measurements.',
    status: 'upcoming',
    color: 'bg-blue-400',
  },
  {
    icon: Box,
    title: '2D to 3D Generation',
    description: 'Transform 2D floor plans into interactive 3D building models.',
    status: 'upcoming',
    color: 'bg-purple-400',
  },
  {
    icon: Palette,
    title: 'Material Analysis',
    description: 'AI recommends appropriate materials based on detected structural elements.',
    status: 'upcoming',
    color: 'bg-orange-400',
  },
  {
    icon: Brain,
    title: 'Explainability',
    description: 'Transparent AI reasoning and confidence scores for all detections.',
    status: 'upcoming',
    color: 'bg-indigo-400',
  },
]

export default function PipelineStages() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration - Black vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-black opacity-20" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-6 py-2 bg-white border-4 border-black shadow-[4px_4px_0_0_#000000] text-sm font-black text-black pixel-text uppercase tracking-widest mb-6">
            Hackathon Roadmap
          </span>
          <h2 className="text-5xl font-black text-black mb-6 pixel-text uppercase tracking-widest drop-shadow-md">
            Pipeline Stages
          </h2>
          <p className="text-black font-bold text-lg max-w-2xl mx-auto pixel-text uppercase tracking-widest border-b-4 border-black pb-4 inline-block">
            Our comprehensive AI pipeline for floor plan analysis
          </p>
        </motion.div>
        
        <div className="relative">
          {stages.map((stage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-12 mb-16 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Content */}
              <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                <motion.div
                  whileHover={{ scale: 1.02, x: index % 2 === 0 ? -4 : 4 }}
                  className={`voxel-panel bg-white p-6 inline-block shadow-[6px_6px_0_0_#000000] hover:shadow-[10px_10px_0_0_#000000] transition-all ${
                    stage.status === 'active' ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-[#80C8C6]' : ''
                  }`}
                >
                  <div className={`flex items-center gap-4 mb-4 ${
                    index % 2 === 0 ? 'justify-end' : 'justify-start'
                  }`}>
                    {stage.status === 'active' && (
                      <span className="flex items-center gap-2 text-sm font-black text-black bg-green-400 border-2 border-black px-3 py-1 pixel-text uppercase">
                        <CheckCircle2 className="w-4 h-4" />
                        Active
                      </span>
                    )}
                    {stage.status === 'upcoming' && (
                      <span className="text-sm font-black text-black bg-gray-200 border-2 border-black px-3 py-1 pixel-text uppercase opacity-60">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-black mb-3 pixel-text uppercase tracking-widest">{stage.title}</h3>
                  <p className="text-black font-bold pixel-text text-sm leading-snug">{stage.description}</p>
                </motion.div>
              </div>
              
              {/* Icon */}
              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 5 : -5 }}
                  className={`w-20 h-20 border-4 border-black ${stage.color} flex items-center justify-center shadow-[6px_6px_0_0_#000000] ${
                    stage.status === 'active' ? '' : 'grayscale opacity-80'
                  }`}
                >
                  <stage.icon className="w-10 h-10 text-black stroke-[3]" />
                </motion.div>
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 border-4 border-black flex items-center justify-center text-lg font-black text-black pixel-text shadow-[2px_2px_0_0_#000000]">
                  {index + 1}
                </div>
              </div>
              
              {/* Spacer for alignment */}
              <div className="flex-1" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
