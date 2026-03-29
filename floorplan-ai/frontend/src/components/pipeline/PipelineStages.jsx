import { motion } from 'framer-motion'
import { Scan, Shapes, Box, Palette, Brain, CheckCircle2 } from 'lucide-react'

const stages = [
  {
    icon: Scan,
    title: 'Floor Plan Parsing',
    description: 'AI detects walls, doors, windows, and architectural elements from uploaded images.',
    status: 'active',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shapes,
    title: 'Geometry Reconstruction',
    description: 'Convert detected elements into precise geometric shapes and measurements.',
    status: 'upcoming',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Box,
    title: '2D to 3D Generation',
    description: 'Transform 2D floor plans into interactive 3D building models.',
    status: 'upcoming',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Palette,
    title: 'Material Analysis',
    description: 'AI recommends appropriate materials based on detected structural elements.',
    status: 'upcoming',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Brain,
    title: 'Explainability',
    description: 'Transparent AI reasoning and confidence scores for all detections.',
    status: 'upcoming',
    color: 'from-indigo-500 to-violet-500',
  },
]

export default function PipelineStages() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full glass text-sm font-medium text-primary-400 mb-4">
            Hackathon Roadmap
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">
            Pipeline Stages
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Our comprehensive AI pipeline for floor plan analysis and 3D visualization
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
              className={`flex items-center gap-8 mb-12 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Content */}
              <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`glass-card p-6 inline-block ${
                    stage.status === 'active' ? 'border-primary-500/50' : ''
                  }`}
                >
                  <div className={`flex items-center gap-3 mb-3 ${
                    index % 2 === 0 ? 'justify-end' : 'justify-start'
                  }`}>
                    {stage.status === 'active' && (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    )}
                    {stage.status === 'upcoming' && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-500/20 px-2 py-1 rounded-full">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{stage.title}</h3>
                  <p className="text-slate-400 text-sm">{stage.description}</p>
                </motion.div>
              </div>
              
              {/* Icon */}
              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-lg ${
                    stage.status === 'active' ? 'ring-4 ring-white/20' : 'opacity-60'
                  }`}
                >
                  <stage.icon className="w-8 h-8 text-white" />
                </motion.div>
                {/* Step number */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-xs font-bold text-white">
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
