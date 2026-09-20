import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import FCFS from './pages/algorithms/FCFS';
import SJF from './pages/algorithms/SJF';
import SRTF from './pages/algorithms/SRTF';
import RoundRobin from './pages/algorithms/RoundRobin';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/algorithms/fcfs" element={<FCFS />} />
          <Route path="/algorithms/sjf" element={<SJF />} />
          <Route path="/algorithms/srtf" element={<SRTF />} />
          <Route path="/algorithms/round-robin" element={<RoundRobin />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
      <ChatBot />
    </>
  );
}
