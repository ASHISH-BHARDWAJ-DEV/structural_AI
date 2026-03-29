import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Scan, Box, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/detect', label: 'Detect', icon: Scan },
  { path: '/visualize', label: '3D View', icon: Box },
]

export default function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Box className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">FloorPlan AI</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 font-medium">{link.label}</span>
                </Link>
              )
            })}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <motion.div
        initial={false}
        animate={{ height: mobileMenuOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden"
      >
        <div className="px-4 py-2 space-y-1 border-t border-white/10">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </motion.nav>
  )
}
