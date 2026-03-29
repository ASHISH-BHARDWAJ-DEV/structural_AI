import React from 'react';

export default function ShowcaseOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col">
      {/* Top Header */}
      <header className="pointer-events-auto w-full bg-black/20 backdrop-blur-md text-white p-6 flex justify-between items-center">
        <div className="font-bold text-xl tracking-widest pl-2">NOVA</div>
        
        <nav className="hidden md:flex gap-10 text-xs font-semibold tracking-[0.2em] text-white/80">
          <a href="#" className="hover:text-white transition-colors py-2 border-b border-transparent hover:border-white">PROPERTIES</a>
          <a href="#" className="hover:text-white transition-colors py-2 border-b border-white">SHOWCASE</a>
          <a href="#" className="hover:text-white transition-colors py-2 border-b border-transparent hover:border-white">ABOUT</a>
          <a href="#" className="hover:text-white transition-colors py-2 border-b border-transparent hover:border-white">CONTACT</a>
        </nav>
        
        <button className="p-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors mr-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative w-full">
        {/* Left Panel */}
        <div className="pointer-events-auto absolute left-8 top-1/2 -translate-y-1/2 bg-black/10 backdrop-blur-md p-10 max-w-lg rounded-xl border border-white/10 text-white shadow-2xl">
          <div className="text-xs font-bold tracking-[0.25em] text-amber-500 mb-3 flex items-center gap-2">
            <span className="w-8 h-px bg-amber-500"></span>
            FEATURED PROPERTY
          </div>
          
          <h1 className="text-6xl font-light mb-4 tracking-tighter">
            VILLA <span className="font-bold">NOVA</span>
          </h1>
          
          <div className="text-4xl font-light text-amber-400 mb-6 drop-shadow-md">
            $2.4M
          </div>
          
          <p className="text-white/70 leading-relaxed mb-10 text-sm font-light">
            An architectural masterpiece blending seamlessly with its environment. 
            Experience uncompromising luxury with panoramic views and state-of-the-art smart home integration.
          </p>
          
          <button className="bg-white text-black px-10 py-4 rounded-none font-bold tracking-widest text-xs hover:bg-amber-500 hover:text-white transition-all duration-300 w-full sm:w-auto shadow-lg shadow-black/20">
            SCHEDULE TOUR
          </button>
        </div>

        {/* Right Panel */}
        <div className="pointer-events-auto absolute right-8 top-1/2 -translate-y-1/2 bg-black/10 backdrop-blur-md p-8 w-80 rounded-xl border border-white/10 text-white hidden lg:block shadow-2xl">
          <h2 className="text-xs font-bold tracking-[0.2em] text-white/50 mb-8 uppercase flex items-center gap-2">
            PROPERTY METRICS
            <span className="flex-1 h-px bg-white/10"></span>
          </h2>
          
          <ul className="space-y-6">
            <li className="flex justify-between items-end border-b border-white/5 pb-3 group">
              <span className="text-white/50 text-xs font-medium tracking-wide group-hover:text-white/80 transition-colors">Area</span>
              <span className="font-medium tracking-widest text-sm text-right">4,200 SQFT</span>
            </li>
            <li className="flex justify-between items-end border-b border-white/5 pb-3 group">
              <span className="text-white/50 text-xs font-medium tracking-wide group-hover:text-white/80 transition-colors">Efficiency</span>
              <span className="font-medium tracking-widest text-sm text-amber-400 text-right">A+ RATING</span>
            </li>
            <li className="flex justify-between items-end border-b border-white/5 pb-3 group">
              <span className="text-white/50 text-xs font-medium tracking-wide group-hover:text-white/80 transition-colors">Structure</span>
              <span className="font-medium tracking-widest text-sm text-right">STEEL & GLASS</span>
            </li>
            <li className="flex justify-between items-end border-b border-white/5 pb-3 group">
              <span className="text-white/50 text-xs font-medium tracking-wide group-hover:text-white/80 transition-colors">Smart Integration</span>
              <span className="font-medium tracking-widest text-sm text-right">100%</span>
            </li>
          </ul>
        </div>
        
        {/* Drag to rotate hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-[0.3em] font-medium uppercase pointer-events-none flex flex-col items-center gap-3 animate-pulse">
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
          </svg>
          Drag to rotate
        </div>
      </main>
    </div>
  );
}
