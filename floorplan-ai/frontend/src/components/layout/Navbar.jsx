import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Scan, Box, FlaskConical, Brain, FileText, Menu, X } from 'lucide-react';

const navLinks = [
  { path: '/app',                  label: 'DASHBOARD',      icon: Home         },
  { path: '/app/detection',        label: 'DETECTION',      icon: Scan         },
  { path: '/app/visualization',    label: '3D VIEW',        icon: Box          },
  { path: '/app/materials',        label: 'MATERIALS',      icon: FlaskConical },
  { path: '/app/explainability',   label: 'EXPLAINABILITY', icon: Brain        },
  { path: '/app/cost-breakdown',   label: 'COST REPORT',    icon: FileText     },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#80C8C6] border-b-4 border-black font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group pointer-events-auto">
            <div className="w-12 h-12 bg-yellow-400 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
              <Box className="w-7 h-7 text-black stroke-[3]" />
            </div>
            <span className="text-2xl font-black text-black pixel-text tracking-widest uppercase">
              FloorPlan AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-base font-black pixel-text tracking-widest transition-all duration-200 uppercase
                    ${isActive
                      ? 'bg-yellow-400 border-4 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'text-black hover:bg-white/40 border-4 border-transparent hover:border-black'
                    }
                  `}
                >
                  <link.icon className="w-4 h-4 stroke-[3]" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-8 h-8 text-black stroke-[3]" /> : <Menu className="w-8 h-8 text-black stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b-4 border-black p-4 space-y-4"
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-4 px-6 py-4 text-xl font-black pixel-text tracking-widest uppercase border-4
                    ${isActive
                      ? 'bg-yellow-400 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white border-transparent text-black'
                    }
                  `}
                >
                  <link.icon className="w-6 h-6 stroke-[3]" />
                  {link.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
