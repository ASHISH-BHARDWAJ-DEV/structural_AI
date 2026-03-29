import { motion } from 'framer-motion'
import { Upload, Scan, Box, FileJson, Layers, Palette } from 'lucide-react'

const features = [
  {
    icon: Upload,
    title: 'Easy Upload',
    description: 'Drag and drop or click to upload your floor plan images in PNG, JPG, or JPEG format.',
    color: 'bg-blue-400',
  },
  {
    icon: Scan,
    title: 'AI Detection',
    description: 'YOLOv8-powered detection identifies walls, doors, windows, columns, and more.',
    color: 'bg-green-400',
  },
  {
    icon: FileJson,
    title: 'Structured Output',
    description: 'Get detailed JSON with coordinates, confidence scores, and bounding boxes.',
    color: 'bg-purple-400',
  },
  {
    icon: Box,
    title: '3D Visualization',
    description: 'Transform 2D detections into interactive 3D models using Three.js.',
    color: 'bg-orange-400',
  },
  {
    icon: Layers,
    title: 'Multi-Element',
    description: 'Detect multiple architectural elements in a single analysis pass.',
    color: 'bg-pink-400',
  },
  {
    icon: Palette,
    title: 'Annotated Preview',
    description: 'View color-coded annotations overlaid on your original floor plan.',
    color: 'bg-teal-400',
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
          <h2 className="text-5xl font-black text-black mb-6 pixel-text uppercase tracking-widest drop-shadow-md">
            Powerful Features
          </h2>
          <p className="text-black font-bold text-xl max-w-2xl mx-auto pixel-text uppercase tracking-widest border-y-4 border-black py-4 inline-block">
            Everything you need to analyze floor plans and create 3D visualizations
          </p>
        </motion.div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -8, x: -4 }}
              className="voxel-panel bg-white p-8 group cursor-pointer shadow-[8px_8px_0_0_#000000] hover:shadow-[12px_12px_0_0_#000000] transition-all"
            >
              <div className={`w-16 h-16 border-4 border-black ${feature.color} flex items-center justify-center mb-6 shadow-[4px_4px_0_0_#000000] group-hover:-translate-y-1 transition-transform`}>
                <feature.icon className="w-8 h-8 text-black stroke-[3]" />
              </div>
              <h3 className="text-2xl font-black text-black mb-4 pixel-text uppercase tracking-widest">{feature.title}</h3>
              <p className="text-black font-bold pixel-text text-lg leading-tight">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
