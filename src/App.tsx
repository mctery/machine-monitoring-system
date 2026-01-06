// src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// Lazy load route components for better performance
const TimelineViewer = lazy(() => import('./components/TimelineViewer'));
const MachineStatusPage = lazy(() => import('./pages/MachineStatusPage'));
const MachineSetup = lazy(() => import('./components/MachineSetup'));
const SimulationPage = lazy(() => import('./components/SimulationPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<TimelineViewer />} />
                <Route path="/status" element={<MachineStatusPage />} />
                <Route path="/setup" element={<MachineSetup />} />
                {/* Only show Simulation route in development mode */}
                {import.meta.env.DEV && (
                  <Route path="/simulation" element={<SimulationPage />} />
                )}
              </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
