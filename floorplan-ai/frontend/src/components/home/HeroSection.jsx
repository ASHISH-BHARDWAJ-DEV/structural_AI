import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'

export default function HeroSection() {
  const navigate = useNavigate()
  
  return (
    <section className="min-h-[90vh] relative overflow-hidden">
      {/* Grid pattern - subtle overlay */}
      <div 
        className="absolute inset-0 opacity-10 z-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left pt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Voxel Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-white border-4 border-black shadow-[4px_4px_0_0_#000000] mb-12"
          >
            <Sparkles className="w-5 h-5 text-black" />
            <span className="text-sm font-black text-black pixel-text uppercase tracking-widest">
              AI-Powered Architecture Analysis
            </span>
          </motion.div>
          
          {/* Main heading - Voxel Style */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-8 leading-none text-black pixel-text uppercase tracking-tight">
            Transform <br />
            Floor Plans <br />
            <span className="bg-yellow-400 px-4 mt-2 inline-block border-4 border-black shadow-[6px_6px_0_0_#000000]">
              Into 3D Reality
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-black font-bold pixel-text uppercase tracking-widest max-w-2xl mb-12 bg-white/30 p-4 border-l-8 border-black">
            Upload your architectural floor plans and let AI detect walls, doors, windows, 
            and more. Then visualize everything in stunning 3D.
          </p>
          
          {/* CTA Buttons - Voxel Style */}
          <div className="flex flex-col sm:flex-row items-start justify-start gap-6">
            <button
              onClick={() => navigate('/app/detection')}
              className="bg-yellow-400 border-4 border-black text-black font-black uppercase px-10 py-4 text-xl pixel-text tracking-widest hover:bg-yellow-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000000] active:translate-y-1 active:shadow-none transition-all flex items-center gap-3"
            >
              Start Analyzing
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>
            
            <button
              onClick={() => navigate('/app/visualization')}
              className="bg-white border-4 border-black text-black font-black uppercase px-10 py-4 text-xl pixel-text tracking-widest hover:bg-gray-100 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000000] active:translate-y-1 active:shadow-none transition-all"
            >
              View 3D Demo
            </button>
          </div>
          
          {/* Stats - Voxel Columns */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl"
          >
            {[
              { icon: Zap, label: 'Fast Detection', value: '<2s' },
              { icon: Shield, label: 'Accuracy', value: '95%+' },
              { icon: Sparkles, label: 'Object Types', value: '5+' },
            ].map((stat, i) => (
              <div key={i} className="text-left border-l-4 border-black pl-4">
                <stat.icon className="w-6 h-6 text-black mb-2" />
                <div className="text-3xl font-black text-black pixel-text uppercase">{stat.value}</div>
                <div className="text-xs font-bold text-black pixel-text uppercase tracking-tighter">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
