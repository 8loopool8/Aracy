import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CheckCircle2, Circle, Sparkles } from "lucide-react";

/**
 * THE 19 RITUAL - Daily Alints Display
 * 
 * Features:
 * - Displays 19 AI-generated alints as stardust cards
 * - Each card has a checkbox to mark as "reflected upon"
 * - Cards flip to reveal content with animation
 * - Progress tracking (X/19 reflected)
 * - Saves state to backend/Supabase
 */
export default function The19Ritual({ endearments, onReflect, bondId }) {
  const [reflectedItems, setReflectedItems] = useState(new Set());
  const [revealedCards, setRevealedCards] = useState(new Set());

  // Load reflected state from backend on mount
  useEffect(() => {
    if (bondId) {
      fetchReflectedState();
    }
  }, [bondId]);

  const fetchReflectedState = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://aracy.onrender.com';
      const res = await fetch(`${apiUrl}/api/ritual/reflected/${bondId}`);
      if (res.ok) {
        const data = await res.json();
        setReflectedItems(new Set(data.reflected_indices || []));
      }
    } catch (err) {
      console.error("Failed to fetch reflected state:", err);
    }
  };

  const handleReveal = (index) => {
    setRevealedCards((prev) => new Set([...prev, index]));
  };

  const handleReflect = async (index) => {
    const newReflected = new Set(reflectedItems);
    if (newReflected.has(index)) {
      newReflected.delete(index);
    } else {
      newReflected.add(index);
    }
    setReflectedItems(newReflected);

    // Save to backend
    if (onReflect) {
      onReflect(index, newReflected.has(index));
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://aracy.onrender.com';
      await fetch(`${apiUrl}/api/ritual/reflect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bond_id: bondId,
          index,
          reflected: newReflected.has(index),
        }),
      });
    } catch (err) {
      console.error("Failed to save reflection:", err);
    }
  };

  const progress = reflectedItems.size;
  const total = endearments?.length || 19;
  const progressPercent = (progress / total) * 100;

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-goth-gold to-goth-purple shadow-[0_0_30px_#d4af37] mb-4"
          animate={{
            boxShadow: [
              "0 0 30px #d4af37",
              "0 0 50px #d4af37, 0 0 80px #7e22ce",
              "0 0 30px #d4af37",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Heart className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-4xl font-serif italic font-bold text-goth-gold tracking-[0.3em] mb-3">
          THE 19 RITUAL
        </h2>
        <p className="text-goth-gold/70 text-lg tracking-wider mb-6">
          Daily Alints from The Alchemist
        </p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-goth-gold/70 font-serif">Reflected Upon</span>
            <span className="text-sm text-goth-gold font-bold font-serif">
              {progress} / {total}
            </span>
          </div>
          <div className="w-full h-3 bg-goth-bg/50 rounded-full border border-goth-gold/30 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-goth-purple via-goth-gold to-goth-purple shadow-[0_0_15px_#d4af37]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Alint Cards Grid - 3xN Layout */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <AnimatePresence>
          {endearments?.map((item, index) => {
            const isRevealed = revealedCards.has(index);
            const isReflected = reflectedItems.has(index);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="relative aspect-square"
              >
                {/* Compact Card with Golden Checkbox */}
                <motion.div
                  className={`relative w-full h-full rounded-xl cursor-pointer border-2 transition-all ${
                    isReflected
                      ? "bg-gradient-to-br from-goth-gold/40 to-goth-purple/40 border-goth-gold shadow-[0_0_20px_#d4af37]"
                      : "bg-black/40 border-goth-gold/30 hover:border-goth-gold/60"
                  }`}
                  onClick={() => handleReflect(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Golden Checkbox */}
                  <div className="absolute top-2 right-2 z-10">
                    <motion.div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isReflected
                          ? "bg-goth-gold border-goth-gold"
                          : "bg-transparent border-goth-gold/50"
                      }`}
                      animate={
                        isReflected
                          ? {
                              boxShadow: [
                                "0 0 10px #d4af37",
                                "0 0 20px #d4af37",
                                "0 0 10px #d4af37",
                              ],
                            }
                          : {}
                      }
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {isReflected && <CheckCircle2 className="w-4 h-4 text-goth-bg" />}
                    </motion.div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3 flex flex-col items-center justify-center h-full text-center">
                    <span className="text-xs text-goth-gold/50 mb-1">#{index + 1}</span>
                    <h3 className="text-sm font-serif italic font-bold text-goth-gold line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-goth-gold/60 mt-1 line-clamp-2">
                      {item.origin}
                    </p>
                  </div>

                  {/* Ornate Corner Decorations */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-goth-gold/40"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-goth-gold/40"></div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Seal the Ritual Button */}
      <motion.button
        onClick={() => {
          // TODO: Save ritual to backend
          alert(`Ritual sealed! ${progress}/${total} alints reflected.`);
        }}
        disabled={progress === 0}
        className="relative w-full h-24 rounded-2xl font-serif tracking-[0.2em] uppercase text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden border-4 border-goth-gold/60 mt-8"
        whileHover={progress > 0 ? { scale: 1.02 } : {}}
        whileTap={progress > 0 ? { scale: 0.98 } : {}}
        style={{
          background: "radial-gradient(circle at center, #7e22ce 0%, #4b006e 50%, #1a0033 100%)",
        }}
      >
        {/* Pulsating Glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={
            progress > 0
              ? {
                  boxShadow: [
                    "inset 0 0 30px #d4af37, 0 0 30px #d4af37",
                    "inset 0 0 50px #d4af37, 0 0 50px #d4af37, 0 0 80px #7e22ce",
                    "inset 0 0 30px #d4af37, 0 0 30px #d4af37",
                  ],
                }
              : {}
          }
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Button Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2">
          <motion.div
            className="text-4xl"
            animate={
              progress === total
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity }}
          >
            {progress === total ? "🔮" : "📜"}
          </motion.div>
          <span className="text-base">
            {progress === total ? "RITUAL COMPLETE - SEAL IT!" : "SEAL THE RITUAL"}
          </span>
          <span className="text-xs text-goth-gold/70">
            {progress}/{total} Selected
          </span>
        </div>

        {/* Corner Ornaments */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-goth-gold/60"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-goth-gold/60"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-goth-gold/60"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-goth-gold/60"></div>
      </motion.button>
    </motion.div>
  );
}
