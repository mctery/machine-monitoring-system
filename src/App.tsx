// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import TimelineViewer from './components/TimelineViewer';
import MachineStatusPage from './pages/MachineStatusPage';
import MachineSetup from './components/MachineSetup';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Routes>
          <Route path="/" element={<TimelineViewer />} />
          <Route path="/status" element={<MachineStatusPage />} />
          <Route path="/setup" element={<MachineSetup />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
