import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import DetectionPage from './pages/DetectionPage';
import VisualizationPage from './pages/VisualizationPage';
import MaterialsPage from './pages/MaterialsPage';
import CostBreakdownPage from './pages/CostBreakdownPage';
import ExplainabilityPage from './pages/ExplainabilityPage';
import Navbar from './components/layout/Navbar';

// Main app layout with navbar
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

      {/* Nested App Routes with layout */}
      <Route path="/app" element={<MainAppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="detection" element={<DetectionPage />} />
        <Route path="visualization" element={<VisualizationPage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="explainability" element={<ExplainabilityPage />} />
        <Route path="cost-breakdown" element={<CostBreakdownPage />} />
      </Route>
    </Routes>
  );
}

export default App;
