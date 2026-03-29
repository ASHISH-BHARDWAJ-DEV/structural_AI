import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import DetectionPage from './pages/DetectionPage';
import VisualizationPage from './pages/VisualizationPage';
import Navbar from './components/layout/Navbar';

// Important: MainAppLayout matches the exact structure requested
const MainAppLayout = () => {
  return (
    <div className="min-h-screen bg-[#80C8C6] flex flex-col font-sans">
      <Navbar /> 
      <main className="flex-grow relative">
        <Outlet /> 
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Landing Page Route */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Nested App Routes with specific layout */}
      <Route path="/app" element={<MainAppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="detection" element={<DetectionPage />} />
        <Route path="visualization" element={<VisualizationPage />} />
      </Route>
    </Routes>
  );
}

export default App;
