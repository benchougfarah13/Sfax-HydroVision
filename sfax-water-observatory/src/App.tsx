import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Login from './pages/Login';
import SDGDashboard from './pages/SDGDashboard';
import MapObservatory from './pages/MapObservatory';
import ClimateAnalysis from './pages/ClimateAnalysis';
import WaterQuality from './pages/WaterQuality';
import Drastic from './pages/drastic';
import DroughtMonitoring from './pages/DroughtMonitoring';
import ImpactStimulator from './pages/ImpactStimulator';
import Sidebar from './components/Sidebar';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem('auth_token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <div className="flex h-screen bg-slate-950 text-white">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <main className="flex-1 overflow-y-auto p-4">
                    <Routes>
                      <Route path="/" element={<SDGDashboard />} />
                      <Route path="/observatory" element={<MapObservatory />} />
                      <Route path="/climate" element={<ClimateAnalysis />} />
                      <Route path="/drought-monitoring" element={<DroughtMonitoring />} />
                      <Route path="/water-quality" element={<WaterQuality />} />
                      <Route path="/Drastic" element={<Drastic />} />
                      <Route path="/impact-stimulator" element={<ImpactStimulator />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
