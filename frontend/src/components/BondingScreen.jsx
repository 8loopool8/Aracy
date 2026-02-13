import { useState } from "react";
import { motion } from "framer-motion";

export default function BondingScreen({ onLink }) {
  const [bondCode, setBondCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLink = async () => {
    if (!bondCode.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://aracy.onrender.com';
      
      // In a real app, we would verify with the backend
      // For now, we simulate verification or call the mock endpoint
      const res = await fetch(`${apiUrl}/api/bond/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bond_code: bondCode, user_id: "current-user" }),
      });

      if (res.ok) {
        const data = await res.json();
        onLink(data.bond_id || bondCode);
      } else {
        // Fallback for demo/dev if backend is strict but we want to allow testing
        // onLink(bondCode);
        setError("Invalid Bond Code. The stars do not align.");
      }
    } catch (err) {
      console.error("Bond linking failed:", err);
      // Fallback for offline/dev
       onLink(bondCode);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="p-8 rounded-3xl shadow-[0_0_50px_#d4af3744] bg-goth-purple/20 border-2 border-goth-gold flex flex-col items-center gap-8 max-w-md w-full relative overflow-hidden">
        
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_#d4af37_0%,_transparent_70%)] animate-pulse" />
        </div>

        <h2 className="text-3xl font-serif font-bold text-goth-gold tracking-widest drop-shadow-glow mb-2 text-center z-10">
          THE BOND ENTRANCE
        </h2>
        
        <p className="text-goth-gold/80 text-lg text-center font-light z-10">
          Enter the sacred code to link your souls.
        </p>

        <div className="w-full relative z-10">
            <input
            className="w-full px-6 py-4 rounded-xl outline-none border-2 border-goth-gold/50 bg-black/50 text-goth-gold text-2xl font-bold text-center focus:border-goth-gold transition-all shadow-[0_0_16px_#d4af3722] placeholder-goth-gold/30"
            placeholder="ENTER CODE"
            value={bondCode}
            onChange={e => setBondCode(e.target.value.toUpperCase())}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleLink()}
            />
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
        </div>

        <button
          className="w-full py-4 rounded-xl bg-gradient-to-r from-goth-gold to-yellow-600 text-black font-bold text-xl hover:from-yellow-300 hover:to-yellow-500 shadow-[0_0_20px_#d4af37] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed z-10"
          disabled={!bondCode || isLoading}
          onClick={handleLink}
        >
          {isLoading ? "Weaving Connection..." : "Forge Bond"}
        </button>
        
        <p className="text-xs text-goth-gold/40 mt-4 text-center z-10">
          "Invisible threads are the strongest ties."
        </p>
        
        {/* Version Label for verification */}
        <div className="absolute bottom-2 right-4 text-[10px] text-goth-gold/30 font-mono z-20">
          v1.1-FINAL
        </div>
      </div>
    </motion.div>
  );
}
