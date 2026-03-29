import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'

export default function HeroSection() {
  const navigate = useNavigate()
  
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-full blur-3xl" />
      </div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-slate-300">AI-Powered Architecture Analysis</span>
          </motion.div>
          
          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Transform Floor Plans</span>
            <br />
            <span className="gradient-text animate-gradient bg-300%">Into 3D Reality</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Upload your architectural floor plans and let AI detect walls, doors, windows, 
            and more. Then visualize everything in stunning 3D.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/detect')}
              className="btn-primary flex items-center gap-2 text-lg"
            >
              Start Analyzing
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/visualize')}
              className="btn-secondary flex items-center gap-2 text-lg"
            >
              View 3D Demo
            </motion.button>
          </div>
          
          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { icon: Zap, label: 'Fast Detection', value: '<2s' },
              { icon: Shield, label: 'Accuracy', value: '95%+' },
              { icon: Sparkles, label: 'Object Types', value: '5+' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
