import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TheLab from './components/TheLab';
import The19Ritual from './components/The19Ritual';
import TheEchoStreak from './components/TheEchoStreak';
import TheRiddle from './components/TheRiddle';
import Stardust from './components/Stardust';

function App() {
  const [activeTab, setActiveTab] = useState('lab');
  const [isGenerating, setIsGenerating] = useState(false);
  const [alints, setAlints] = useState(null);
  const [bondId] = useState('demo-bond-id');

  const handleGenerate = async (labParams) => {
    setIsGenerating(true);
    try {
      const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8000'
        : 'https://aracy.onrender.com';
      
      console.log('🔮 Initiating Transmutation...', {
        endpoint: `${API_URL}/api/lab/generate`,
        params: labParams
      });
      
      const res = await fetch(`${API_URL}/api/lab/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          style: labParams.style,
          language: labParams.language,
          catalysts: labParams.catalysts,
          vibe: labParams.vibe
        }),
      });
      
      console.log('📡 Response received:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('✨ Alints generated:', data);
        
        if (data.alints && data.alints.length > 0) {
          setAlints(data.alints);
          setActiveTab('ritual'); // Auto-switch to RITUAL tab
          console.log('🎯 Switched to RITUAL tab with', data.alints.length, 'alints');
        } else if (data.endearments && data.endearments.length > 0) {
          setAlints(data.endearments);
          setActiveTab('ritual'); // Auto-switch to RITUAL tab
          console.log('🎯 Switched to RITUAL tab with', data.endearments.length, 'endearments');
        } else {
          throw new Error('The cosmic forge returned empty... no alints were created.');
        }
      } else {
        const errorText = await res.text();
        console.error('❌ API Error:', {
          status: res.status,
          statusText: res.statusText,
          body: errorText
        });
        
        alert(`🌙 The elements are unstable...\n\nStatus: ${res.status}\nMessage: ${errorText}\n\nCheck the console for the true cause of this disturbance.`);
      }
    } catch (err) {
      console.error('💥 Transmutation failed:', err);
      
      if (err.message.includes('Failed to fetch')) {
        alert(`🔥 The alchemical connection has been severed...\n\nCannot reach the backend at:\n${API_URL}\n\nEnsure the backend is running and CORS is configured.\n\nError: ${err.message}`);
      } else {
        alert(`⚗️ The transmutation ritual encountered an anomaly...\n\nError: ${err.message}\n\nConsult the console for deeper insights.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen relative text-goth-gold font-serif overflow-x-hidden">
      {/* Cosmic Alchemist Nebula Background */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,_#4b006e_0%,_#0a0a0c_70%)]"></div>

      {/* Rotating Transmutation Circle (Dancing Shapes) */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-0 pointer-events-none"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
        style={{ opacity: 0.08 }}
      >
        <svg width="80vw" height="80vw" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer ornate circle */}
          <circle cx="400" cy="400" r="380" stroke="#d4af37" strokeWidth="2" opacity="0.6" />
          <circle cx="400" cy="400" r="360" stroke="#d4af37" strokeWidth="1" opacity="0.4" />
          
          {/* Inner circles */}
          <circle cx="400" cy="400" r="280" stroke="#7e22ce" strokeWidth="2" opacity="0.5" />
          <circle cx="400" cy="400" r="200" stroke="#d4af37" strokeWidth="1.5" opacity="0.6" />
          
          {/* Sacred geometry lines */}
          <line x1="400" y1="20" x2="400" y2="780" stroke="#fff7e6" strokeWidth="0.8" opacity="0.3" />
          <line x1="20" y1="400" x2="780" y2="400" stroke="#fff7e6" strokeWidth="0.8" opacity="0.3" />
          
          {/* Diagonals */}
          <line x1="100" y1="100" x2="700" y2="700" stroke="#d4af37" strokeWidth="0.8" opacity="0.4" />
          <line x1="700" y1="100" x2="100" y2="700" stroke="#d4af37" strokeWidth="0.8" opacity="0.4" />
          
          {/* Hexagram */}
          <path d="M400,150 L550,325 L550,475 L400,650 L250,475 L250,325 Z" stroke="#7e22ce" strokeWidth="1.5" fill="none" opacity="0.3" />
          
          {/* Alchemical symbols */}
          <circle cx="400" cy="150" r="15" stroke="#d4af37" strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx="550" cy="325" r="15" stroke="#d4af37" strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx="550" cy="475" r="15" stroke="#d4af37" strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx="400" cy="650" r="15" stroke="#d4af37" strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx="250" cy="475" r="15" stroke="#d4af37" strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx="250" cy="325" r="15" stroke="#d4af37" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
      </motion.div>

      {/* Stardust particle layer */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <Stardust />
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center py-6 px-4">
        {/* Maximalist Header with Art Nouveau Frame - FIXED HEIGHT */}
        <motion.header
          className="w-full max-w-md mb-6 relative h-32 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Ornate Gold Frame */}
          <div className="absolute inset-0 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-0 w-full h-full opacity-60">
              {/* Top ornate border */}
              <path d="M20,10 Q60,5 100,10 T180,10 T260,10 T340,10 Q360,10 380,15" stroke="#d4af37" strokeWidth="2" fill="none"/>
              {/* Bottom ornate border */}
              <path d="M20,110 Q60,115 100,110 T180,110 T260,110 T340,110 Q360,110 380,105" stroke="#d4af37" strokeWidth="2" fill="none"/>
              {/* Left flourish */}
              <path d="M15,20 Q10,40 15,60 Q10,80 15,100" stroke="#d4af37" strokeWidth="1.5" fill="none"/>
              {/* Right flourish */}
              <path d="M385,20 Q390,40 385,60 Q390,80 385,100" stroke="#d4af37" strokeWidth="1.5" fill="none"/>
              {/* Corner decorations */}
              <circle cx="20" cy="15" r="5" stroke="#d4af37" strokeWidth="1" fill="none"/>
              <circle cx="380" cy="15" r="5" stroke="#d4af37" strokeWidth="1" fill="none"/>
              <circle cx="20" cy="105" r="5" stroke="#d4af37" strokeWidth="1" fill="none"/>
              <circle cx="380" cy="105" r="5" stroke="#d4af37" strokeWidth="1" fill="none"/>
            </svg>
          </div>

          {/* Title with Quote - ALWAYS VISIBLE */}
          <div className="text-center py-4 relative z-50">
            <motion.h1
              className="text-5xl font-bold tracking-[0.3em] mb-2"
              style={{
                color: '#d4af37',
                textShadow: '0 0 20px #d4af37, 0 0 40px #d4af37',
                fontFamily: 'Cinzel, serif',
              }}
              animate={{
                textShadow: [
                  '0 0 20px #d4af37, 0 0 40px #d4af37',
                  '0 0 30px #d4af37, 0 0 60px #d4af37, 0 0 80px #7e22ce',
                  '0 0 20px #d4af37, 0 0 40px #d4af37',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ARACY
            </motion.h1>
            <p className="text-sm tracking-[0.2em] text-goth-gold/80 italic font-light">
              "Give birth to love every morning"
            </p>
          </div>
        </motion.header>

        {/* Navigation Tabs - MORE PROMINENT AND CENTERED */}
        <nav className="flex justify-center gap-3 mb-8 w-full max-w-md">
          {[
            { id: 'echo', label: 'ECHO', icon: '🔥' },
            { id: 'lab', label: 'LAB', icon: '⚗️' },
            { id: 'ritual', label: 'RITUAL', icon: '💫' },
            { id: 'riddle', label: 'RIDDLE', icon: '🧠' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 rounded-lg font-serif text-sm tracking-wider transition-all border-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-goth-gold/30 to-goth-purple/30 border-goth-gold text-goth-gold shadow-[0_0_20px_#d4af37]'
                  : 'bg-black/30 border-goth-gold/30 text-goth-gold/60 hover:border-goth-gold/60'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-1 text-base">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 w-1/2 h-0.5 bg-goth-gold"
                  layoutId="activeTab"
                  style={{ translateX: '-50%' }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Content Area with Cross-fade Animation */}
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            {activeTab === 'echo' && (
              <motion.div
                key="echo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <TheEchoStreak bondId={bondId} />
              </motion.div>
            )}

            {activeTab === 'lab' && (
              <motion.div
                key="lab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <TheLab onGenerate={handleGenerate} isGenerating={isGenerating} />
              </motion.div>
            )}

            {activeTab === 'ritual' && (
              <motion.div
                key="ritual"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                {alints ? (
                  <The19Ritual endearments={alints} bondId={bondId} />
                ) : (
                  <div className="text-center py-20 px-6 rounded-2xl bg-black/30 border-2 border-goth-gold/30">
                    <p className="text-xl font-serif italic text-goth-gold/70">
                      ✨ Generate alints in The Lab first ✨
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'riddle' && (
              <motion.div
                key="riddle"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <TheRiddle bondId={bondId} partnerName="Ale" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;