import { motion } from 'framer-motion'

export default function LoadingOverlay({ message = 'Processing...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
    >
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 border-r-primary-500"
          />
          
          {/* Inner ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border-4 border-transparent border-b-accent-500 border-l-accent-500"
          />
          
          {/* Center dot */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500"
          />
        </div>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-semibold text-white mb-2"
        >
          {message}
        </motion.p>
        
        <p className="text-slate-400">
          This may take a few seconds...
        </p>
      </div>
    </motion.div>
  )
}
