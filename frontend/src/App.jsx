import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BondingScreen from './components/BondingScreen';
import ProfileEditor from './components/ProfileEditor';
import ResourceFootprint from './components/ResourceFootprint';
import ExpertLogViewer from './components/ExpertLogViewer';
import Stardust from './components/Stardust';

// Dashboard placeholder
function Dashboard() {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, filter: "drop-shadow(0 0 16px #d4af3780)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen flex flex-col gap-6 items-center justify-center bg-goth-bg text-goth-gold"
    >
      <h2 className="text-3xl font-bold text-goth-gold mb-4">Dashboard</h2>
      <p className="text-lg text-goth-purple">Here you will find your daily flames and secret bonds.</p>
    </motion.div>
  );
}

// Animation wrapper for page transitions
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname} location={location}>
        <Route path="/" element={
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, filter: "drop-shadow(0 0 20px #4b006e)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <ProfileEditor />
          </motion.div>} />
        <Route path="/bonding" element={
          <motion.div
            key="bonding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, filter: "drop-shadow(0 0 20px #d4af37)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <BondingScreen />
          </motion.div>} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

import { useEffect, useState, createContext, useContext } from "react";

// Ritual Context/Provider for "Night Before" and saving rituals
const RitualContext = createContext();

export function useRitual() {
  return useContext(RitualContext);
}

function RitualProvider({ children }) {
  // nightBefore: string | null, can expand to richer logic
  const [nightBefore, setNightBefore] = useState(null);

  // ritualResults: { [category]: { result, is_revealed } }
  const [ritualResults, setRitualResults] = useState({});

  const saveCategory = (category, value) => {
    // Save ritual "result" for a category, always as is_revealed: false
    setRitualResults(res => ({
      ...res,
      [category]: { result: value, is_revealed: false }
    }));
  };

  // Later: can integrate backend/Supabase sync here
  const value = {
    nightBefore,
    setNightBefore,
    ritualResults,
    saveCategory,
  };

  return (
    <RitualContext.Provider value={value}>
      {children}
    </RitualContext.Provider>
  );
}


export default function App() {
  return (
    <div className="min-h-screen relative text-goth-gold font-serif">

      {/* Witchy-Crystal: Cosmic Alchemist Nebula Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_#4b006e_0%,_#0a0a0c_70%)]"></div>

      {/* Rotating Transmutation Circle overlay (sacred geometry, SVG) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
        style={{ opacity: 0.10 }}
      >
        {/* Sample SVG: replace shapes for more ornate geometry */}
        <svg width="52vw" height="52vw" viewBox="0 0 650 650" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer circle */}
          <circle cx="325" cy="325" r="320" stroke="#d4af37" strokeWidth="3.2" />
          {/* Inner circle */}
          <circle cx="325" cy="325" r="200" stroke="#7e22ce" strokeWidth="2.4" />
          {/* Geometric/star lines for art nouveau alchemy look */}
          <g>
            <line x1="325" y1="25" x2="325" y2="625" stroke="#fff7e6" strokeWidth="1.1" />
            <line x1="25" y1="325" x2="625" y2="325" stroke="#fff7e6" strokeWidth="1.1" />
            {/* Diagonals */}
            <line x1="80" y1="80" x2="570" y2="570" stroke="#d4af37" strokeWidth="1.1" />
            <line x1="570" y1="80" x2="80" y2="570" stroke="#d4af37" strokeWidth="1.1" />
          </g>
          {/* Add more alchemical marks or sacred geometry as desired */}
        </svg>
      </motion.div>

      {/* Stardust particle layer (between nebula/SVG and UI) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <Stardust />
      </div>

      {/* Main app content (card/UI/etc) */}
      <div className="relative z-30">
        <RitualProvider>
          <Router>
            <AnimatedRoutes />
          </Router>
          <ResourceFootprint />
          <ExpertLogViewer />
        </RitualProvider>
      </div>
    </div>
  );
}
