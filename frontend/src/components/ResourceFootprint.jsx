import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Cpu, Zap } from "lucide-react";

/**
 * ResourceFootprint Component
 * 
 * Displays system resource usage in an Art Nouveau gold-etched plaque style.
 * Shows memory usage and estimated token count for AI operations.
 * Styled to match the goth-celestial-alchemy aesthetic of ARACY.
 */
export default function ResourceFootprint() {
  const [footprint, setFootprint] = useState({
    memory: 0,
    tokens: 0,
    timestamp: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch resource footprint from backend
    async function fetchFootprint() {
      try {
        const res = await fetch("/api/resource-footprint");
        if (!res.ok) throw new Error("Failed to fetch resource footprint");
        const data = await res.json();
        setFootprint({
          memory: data.memory_mb || 0,
          tokens: data.estimated_tokens || 0,
          timestamp: new Date()
        });
        setIsLoading(false);
      } catch (err) {
        console.error("Resource footprint fetch error:", err);
        setIsLoading(false);
      }
    }

    fetchFootprint();
    // Refresh every 30 seconds
    const interval = setInterval(fetchFootprint, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Gold-etched plaque container */}
      <div className="relative">
        {/* Ornate Art Nouveau frame */}
        <svg
          width="280"
          height="120"
          viewBox="0 0 280 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 pointer-events-none"
          style={{ filter: "drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))" }}
        >
          {/* Corner flourishes */}
          <path
            d="M10,10 Q20,15 25,25 M255,10 Q250,15 245,25 M10,110 Q20,105 25,95 M255,110 Q250,105 245,95"
            stroke="#d4af37"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Border */}
          <rect
            x="8"
            y="8"
            width="264"
            height="104"
            rx="12"
            stroke="#d4af37"
            strokeWidth="2"
            fill="none"
          />
          {/* Inner decorative line */}
          <rect
            x="12"
            y="12"
            width="256"
            height="96"
            rx="10"
            stroke="#d4af37"
            strokeWidth="0.5"
            fill="none"
            opacity="0.5"
          />
        </svg>

        {/* Content container with glassmorphism */}
        <div className="relative bg-goth-bg/80 backdrop-blur-xl border border-goth-gold/30 rounded-xl p-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          {/* Title plaque */}
          <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-goth-gold/20">
            <span className="text-goth-gold/70 text-xs">✧</span>
            <h3 className="text-goth-gold font-serif italic text-sm tracking-[0.15em] uppercase">
              The Resource Footprint
            </h3>
            <span className="text-goth-gold/70 text-xs">✧</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-6 h-6 text-goth-gold/60" />
              </motion.div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Memory Usage */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-goth-gold/40 bg-goth-gold/5">
                  <Cpu className="w-4 h-4 text-goth-gold/80" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-goth-gold/60 text-xs font-mono uppercase tracking-wider">
                      Memory
                    </span>
                    <span className="text-goth-gold font-bold text-lg font-mono">
                      {footprint.memory.toFixed(2)}
                    </span>
                    <span className="text-goth-gold/70 text-xs font-mono">MB</span>
                  </div>
                </div>
              </div>

              {/* Token Count */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-goth-gold/40 bg-goth-gold/5">
                  <Activity className="w-4 h-4 text-goth-gold/80" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-goth-gold/60 text-xs font-mono uppercase tracking-wider">
                      Tokens
                    </span>
                    <span className="text-goth-gold font-bold text-lg font-mono">
                      {footprint.tokens.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              {footprint.timestamp && (
                <div className="pt-2 border-t border-goth-gold/10">
                  <p className="text-goth-gold/40 text-[10px] font-mono text-center tracking-wider">
                    Last Updated: {footprint.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Alchemical symbol decoration */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <motion.div
              className="w-4 h-4 rounded-full bg-goth-bg border border-goth-gold/60 flex items-center justify-center"
              animate={{
                boxShadow: [
                  "0 0 8px rgba(212, 175, 55, 0.3)",
                  "0 0 16px rgba(212, 175, 55, 0.6)",
                  "0 0 8px rgba(212, 175, 55, 0.3)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="text-goth-gold text-[8px]">⚗</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
