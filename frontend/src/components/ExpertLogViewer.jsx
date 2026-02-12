import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

/**
 * ExpertLogViewer Component
 * 
 * GAMP5-compliant error log viewer with expert 'Ignore' functionality.
 * Allows experts to review and manually validate/dismiss alerts for traceability.
 * Styled in goth-celestial aesthetic with gold accents.
 */
export default function ExpertLogViewer() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all, active, ignored

  useEffect(() => {
    fetchLogs();
    // Refresh logs every 15 seconds
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLogs() {
    try {
      const res = await fetch("/api/logs/errors");
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data.errors || []);
      setIsLoading(false);
    } catch (err) {
      console.error("Log fetch error:", err);
      setIsLoading(false);
    }
  }

  async function handleIgnore(timestamp) {
    try {
      const res = await fetch(`/api/logs/ignore?timestamp=${encodeURIComponent(timestamp)}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to ignore log");
      
      // Update local state
      setLogs(logs.map(log => 
        log.timestamp === timestamp ? { ...log, ignored: true } : log
      ));
    } catch (err) {
      console.error("Ignore error:", err);
      alert("Failed to ignore log entry");
    }
  }

  const filteredLogs = logs.filter(log => {
    if (filter === "active") return !log.ignored;
    if (filter === "ignored") return log.ignored;
    return true;
  });

  const activeLogs = logs.filter(log => !log.ignored).length;

  return (
    <>
      {/* Floating toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-goth-bg/90 backdrop-blur-xl border border-goth-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AlertTriangle className="w-5 h-5 text-goth-gold" />
        <span className="text-goth-gold font-mono text-sm font-bold">
          {activeLogs > 0 ? `${activeLogs} Alert${activeLogs > 1 ? 's' : ''}` : 'Logs'}
        </span>
        {activeLogs > 0 && (
          <motion.span
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Log viewer panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 right-0 h-screen w-[500px] bg-goth-bg/95 backdrop-blur-2xl border-l-2 border-goth-gold/30 shadow-[-10px_0_50px_rgba(0,0,0,0.5)] z-40 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-goth-gold/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-goth-gold text-xl">✧</span>
                  <h2 className="text-2xl font-serif italic text-goth-gold tracking-[0.15em]">
                    Expert Log Console
                  </h2>
                  <span className="text-goth-gold text-xl">✧</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-goth-gold/60 hover:text-goth-gold transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2">
                {["all", "active", "ignored"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                      filter === f
                        ? "bg-goth-gold/20 text-goth-gold border border-goth-gold/40"
                        : "bg-transparent text-goth-gold/50 border border-goth-gold/20 hover:border-goth-gold/40"
                    }`}
                  >
                    {f}
                    {f === "active" && activeLogs > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">
                        {activeLogs}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Log list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-goth-gold"
                  >
                    ⚗
                  </motion.div>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-goth-gold/40">
                  <CheckCircle className="w-12 h-12 mb-3" />
                  <p className="font-mono text-sm">No logs to display</p>
                </div>
              ) : (
                filteredLogs.map((log, idx) => (
                  <motion.div
                    key={log.timestamp || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-lg border ${
                      log.ignored
                        ? "bg-goth-bg/30 border-goth-gold/10"
                        : "bg-goth-bg/60 border-goth-gold/30"
                    } backdrop-blur-sm`}
                  >
                    {/* Log header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-mono uppercase ${
                            log.level === "ERROR"
                              ? "bg-red-500/20 text-red-400"
                              : log.level === "WARNING"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {log.level || "INFO"}
                        </span>
                        {log.ignored && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded bg-goth-gold/10 text-goth-gold/60 text-[10px] font-mono">
                            <EyeOff className="w-3 h-3" />
                            IGNORED
                          </span>
                        )}
                      </div>
                      <span className="text-goth-gold/40 text-[10px] font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {/* Log message */}
                    <p className="text-goth-gold/80 text-sm font-mono mb-3 leading-relaxed">
                      {log.message}
                    </p>

                    {/* Ignore button */}
                    {!log.ignored && (
                      <button
                        onClick={() => handleIgnore(log.timestamp)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-goth-gold/10 hover:bg-goth-gold/20 border border-goth-gold/30 hover:border-goth-gold/50 text-goth-gold text-xs font-mono uppercase tracking-wider transition-all"
                      >
                        <Eye className="w-3 h-3" />
                        Expert Ignore
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-goth-gold/20 bg-goth-bg/80">
              <p className="text-goth-gold/40 text-[10px] font-mono text-center">
                GAMP5 Compliant • Expert Validation Required
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
