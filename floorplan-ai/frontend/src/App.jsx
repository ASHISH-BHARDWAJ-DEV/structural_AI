import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import DetectionPage from './pages/DetectionPage'
import VisualizationPage from './pages/VisualizationPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/detect" element={<DetectionPage />} />
            <Route path="/visualize" element={<VisualizationPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default App
