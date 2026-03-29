import { Github, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="glass border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-slate-400 text-sm">
              © 2024 FloorPlan AI. Built for Hackathon Demo.
            </p>
            <p className="text-slate-500 text-xs mt-1">
              AI-powered floor plan analysis and 3D visualization
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/sanatladkat/floor-plan-object-detection" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
