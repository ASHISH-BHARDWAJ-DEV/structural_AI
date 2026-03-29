import { motion } from 'framer-motion'
import { Upload, Scan, Box, FileJson, Layers, Palette } from 'lucide-react'

const features = [
  {
    icon: Upload,
    title: 'Easy Upload',
    description: 'Drag and drop or click to upload your floor plan images in PNG, JPG, or JPEG format.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Scan,
    title: 'AI Detection',
    description: 'YOLOv8-powered detection identifies walls, doors, windows, columns, and more.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: FileJson,
    title: 'Structured Output',
    description: 'Get detailed JSON with coordinates, confidence scores, and bounding boxes.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Box,
    title: '3D Visualization',
    description: 'Transform 2D detections into interactive 3D models using Three.js.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Layers,
    title: 'Multi-Element',
    description: 'Detect multiple architectural elements in a single analysis pass.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Palette,
    title: 'Annotated Preview',
    description: 'View color-coded annotations overlaid on your original floor plan.',
    color: 'from-pink-500 to-rose-500',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Everything you need to analyze floor plans and create stunning 3D visualizations
          </p>
        </motion.div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card p-6 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
