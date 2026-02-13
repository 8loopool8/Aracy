import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CheckCircle2, Circle, Sparkles } from "lucide-react";
import confetti from 'canvas-confetti';

/**
 * THE 19 RITUAL - Daily Alints Display
 * 
 * Features:
 * - Displays 19 AI-generated alints as stardust cards
 * - Each card has a checkbox to mark as "reflected upon"
 * - Cards flip to reveal content with animation
 * - Progress tracking (X/19 reflected)
 * - Saves state to backend/Supabase
 * - Crystallization of selected alints to the vault
 */
export default function The19Ritual({ endearments, onReflect, bondId }) {
  const [reflectedItems, setReflectedItems] = useState(new Set());
  const [revealedCards, setRevealedCards] = useState(new Set());
  const [isCrystallizing, setIsCrystallizing] = useState(false);
  const [crystallizationComplete, setCrystallizationComplete] = useState(false);

  // Load reflected state from backend on mount
  useEffect(() => {
    if (bondId) {
      fetchReflectedState();
    }
  }, [bondId]);

  const fetchReflectedState = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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

  // Function to crystallize selected alints
  const crystallizeSelectedAlints = async () => {
    if (reflectedItems.size === 0) return;
    
    setIsCrystallizing(true);
    
    try {
      // Prepare the selected alints for crystallization
      const selectedAlints = Array.from(reflectedItems).map(index => {
        const alint = endearments[index];
        
        // Parse the alint string if it's in "Word - Meaning" format
        if (typeof alint === 'string' && alint.includes(' - ')) {
          const [word, meaning] = alint.split(' - ', 2);
          return {
            word,
            meaning,
            language: "Unknown", // Default values
            vibe: "Deep"
          };
        } else if (typeof alint === 'object') {
          // If it's an object with title/origin properties
          return {
            word: alint.title || "Unknown",
            meaning: alint.origin || "Unknown",
            language: alint.language || "Unknown",
            vibe: alint.vibe || "Deep"
          };
        }
        
        // Fallback
        return {
          word: "Unknown",
          meaning: "Unknown meaning",
          language: "Unknown",
          vibe: "Deep"
        };
      });
      
      // Call API to crystallize alints
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/vault/crystallize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alints: selectedAlints
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Crystallization result:", result);
        
        // Show success animation
        setCrystallizationComplete(true);
        
        // Trigger confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#7e22ce', '#4b006e']
        });
        
        // Reset after animation
        setTimeout(() => {
          setCrystallizationComplete(false);
        }, 3000);
      } else {
        console.error("Failed to crystallize alints:", await response.text());
      }
    } catch (error) {
      console.error("Failed to crystallize alints:", error);
    } finally {
      setIsCrystallizing(false);
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

            // Parse the item if it's a string in "Word - Meaning" format
            let title = "";
            let origin = "";
            
            if (typeof item === 'string') {
              if (item.includes(' - ')) {
                const [word, meaning] = item.split(' - ', 2);
                title = word;
                origin = meaning;
              } else {
                title = item;
              }
            } else if (typeof item === 'object') {
              title = item.title || "";
              origin = item.origin || "";
            }

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
                      {title}
                    </h3>
                    <p className="text-xs text-goth-gold/60 mt-1 line-clamp-2">
                      {origin}
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

      {/* Crystallize Button */}
      {progress > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-center"
        >
          <motion.button
            onClick={crystallizeSelectedAlints}
            disabled={isCrystallizing}
            className={`relative px-8 py-4 rounded-xl bg-gradient-to-br from-goth-gold/30 to-goth-purple/30 border-2 border-goth-gold text-goth-gold font-serif tracking-wider ${
              isCrystallizing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_20px_#d4af37]'
            }`}
            whileHover={!isCrystallizing ? { scale: 1.05 } : {}}
            whileTap={!isCrystallizing ? { scale: 0.95 } : {}}
          >
            {isCrystallizing ? (
              <span className="flex items-center">
                <motion.div
                  className="w-5 h-5 mr-2 border-2 border-goth-gold/30 border-t-goth-gold rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Crystallizing...
              </span>
            ) : (
              <>
                <span className="mr-2">✨</span>
                Seal the Ritual
                <span className="ml-2">✨</span>
              </>
            )}
            
            {/* Crystallization Animation */}
            <AnimatePresence>
              {crystallizationComplete && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <motion.div 
                      className="text-4xl mb-2"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      💎
                    </motion.div>
                    <motion.div
                      className="text-goth-gold font-serif tracking-wider"
                      animate={{ 
                        textShadow: [
                          "0 0 5px #d4af37",
                          "0 0 20px #d4af37, 0 0 30px #7e22ce",
                          "0 0 5px #d4af37"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Crystallization Complete
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}