import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Stardust from "./Stardust";
import ResourceFootprint from "./ResourceFootprint";
import { FlaskConical, Palette, Music, Moon } from "lucide-react";
import { useRitual } from "../App";

export default function ProfileEditor() {
  const [form, setForm] = useState({
    displayName: "",
    chemistry: "",
    art: "",
    music: "",
    astrology: "",
    notes: "",
  });
  const [hasFocus, setHasFocus] = useState(false);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const [museContext, setMuseContext] = useState(null);

  const { saveCategory } = useRitual();

  useEffect(() => {
    async function fetchContext() {
      try {
        const res = await fetch("/api/context");
        if (!res.ok) throw new Error("Failed to fetch Muse context.");
        const data = await res.json();
        setMuseContext(data);
      } catch (err) {
        setMuseContext(null);
      }
    }
    fetchContext();
  }, []);

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  // Ritual "save" handler: POST to backend with form fields and muse context
  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setSuccess(false);
    try {
      // Combine form data with muse context
      const payload = { ...form, museContext };
      const res = await fetch("/api/ritual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ritual failed.");
      const data = await res.json();
      // Optionally: update context for first category ('chemistry') as a demo
      saveCategory("chemistry", data.chemistry_result || "");
      setSuccess(true);
    } catch (err) {
      setSuccess(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <motion.div
      className="relative min-h-screen flex flex-col items-center justify-center bg-goth-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <Stardust />
      <ResourceFootprint />
      <motion.form
        onSubmit={handleSubmit}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
        tabIndex={-1}
        className="relative z-30 p-8 rounded-3xl bg-white/5 backdrop-blur-[40px] border-[0.5px] border-white/20 flex flex-col items-center gap-6 max-w-lg w-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-goth-gold/10"
        style={{
          boxShadow: "0 0 70px #d4af3722",
          borderTop: "1px solid rgba(255,255,255,0.3)"
        }}
        animate={hasFocus ? { scale: 1.032, boxShadow: "0 0 70px #d4af37dd" } : { scale: 1, boxShadow: "0 0 70px #d4af3722" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Ornate gold whiplash curves (Art Nouveau frame) */}
        <div className="pointer-events-none absolute inset-0 z-40">
          <svg width="100%" height="100%" viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-0 w-full h-full opacity-80">
            <path d="M20,26 Q70,70 35,280" stroke="#d4af37" strokeWidth="2.1" fill="none"/>
            <path d="M400,26 Q350,70 385,280" stroke="#d4af37" strokeWidth="2.1" fill="none"/>
            <path d="M20,294 Q70,265 210,314 Q350,265 400,294" stroke="#d4af37" strokeWidth="2.3" fill="none"/>
            <path d="M210,28 Q128,62 210,98 Q292,62 210,28" stroke="#d4af37" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        {/* Crystal sheen + top-edge highlight */}
        <div className="absolute top-0 left-0 w-full h-2 pointer-events-none z-30 bg-gradient-to-b from-white/30 to-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] rounded-t-3xl"></div>
<h2 className="text-3xl font-serif italic font-bold text-goth-gold tracking-[0.2em] mb-2 drop-shadow-glow">THE MIRROR LAB</h2>
        <div className="w-full flex flex-col gap-4">
          <input
            type="text"
            name="displayName"
            value={form.displayName}
            onChange={onChange}
            placeholder="Partner's Name"
            className="px-4 py-2 rounded-full border-2 border-goth-gold/30 bg-goth-bg text-goth-gold text-lg font-bold placeholder-goth-gold/60 focus:ring-2 focus:ring-goth-gold/70 focus:border-goth-gold/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all font-mono"
          />
        </div>
        <div className="flex items-center gap-3 w-full group mt-1">
          {/* Icon wrapped in gold circle */}
          <span className="flex items-center justify-center w-8 h-8 rounded-full border-[1.3px] border-goth-gold/65 bg-transparent shadow-[0_0_10px_rgba(212,175,55,0.18)] mr-2">
            <FlaskConical className="w-6 h-6 text-goth-gold/80" />
          </span>
          {/* Gold diamond ✧ at start */}
          <span className="text-goth-gold/70 text-xl font-bold mr-1">✧</span>
          <input
            type="text"
            name="chemistry"
            value={form.chemistry}
            onChange={onChange}
            placeholder="Partner's Essence — Chemistry"
            className="flex-1 px-0 py-2 bg-transparent border-0 border-b-[1.5px] border-goth-gold/50 font-serif italic text-goth-gold tracking-[0.2em] placeholder-goth-gold/70 focus:outline-none focus:border-goth-gold/80 focus:shadow-[0_2px_12px_#d4af37ac] transition-all text-lg"
          />
          {/* Gold diamond ✧ at end */}
          <span className="text-goth-gold/70 text-xl font-bold ml-1">✧</span>
        </div>
        <div className="flex items-center gap-3 w-full group mt-1">
          {/* Icon wrapped in gold circle */}
          <span className="flex items-center justify-center w-8 h-8 rounded-full border-[1.3px] border-goth-gold/65 bg-transparent shadow-[0_0_10px_rgba(212,175,55,0.18)] mr-2">
            <Palette className="w-6 h-6 text-goth-gold/80" />
          </span>
          {/* Gold diamond ✧ at start */}
          <span className="text-goth-gold/70 text-xl font-bold mr-1">✧</span>
          <input
            type="text"
            name="art"
            value={form.art}
            onChange={onChange}
            placeholder="Partner's Essence — Artistic Soul"
            className="flex-1 px-0 py-2 bg-transparent border-0 border-b-[1.5px] border-goth-gold/50 font-serif italic text-goth-gold tracking-[0.2em] placeholder-goth-gold/70 focus:outline-none focus:border-goth-gold/80 focus:shadow-[0_2px_12px_#d4af37ac] transition-all text-lg"
          />
          {/* Gold diamond ✧ at end */}
          <span className="text-goth-gold/70 text-xl font-bold ml-1">✧</span>
        </div>
        <div className="flex items-center gap-3 w-full group mt-1">
          {/* Icon wrapped in gold circle */}
          <span className="flex items-center justify-center w-8 h-8 rounded-full border-[1.3px] border-goth-gold/65 bg-transparent shadow-[0_0_10px_rgba(212,175,55,0.18)] mr-2">
            <Music className="w-6 h-6 text-goth-gold/80" />
          </span>
          {/* Gold diamond ✧ at start */}
          <span className="text-goth-gold/70 text-xl font-bold mr-1">✧</span>
          <input
            type="text"
            name="music"
            value={form.music}
            onChange={onChange}
            placeholder="Partner's Essence — Musical Leanings"
            className="flex-1 px-0 py-2 bg-transparent border-0 border-b-[1.5px] border-goth-gold/50 font-serif italic text-goth-gold tracking-[0.2em] placeholder-goth-gold/70 focus:outline-none focus:border-goth-gold/80 focus:shadow-[0_2px_12px_#d4af37ac] transition-all text-lg"
          />
          {/* Gold diamond ✧ at end */}
          <span className="text-goth-gold/70 text-xl font-bold ml-1">✧</span>
        </div>
        <div className="flex items-center gap-3 w-full group mt-1">
          {/* Icon wrapped in gold circle */}
          <span className="flex items-center justify-center w-8 h-8 rounded-full border-[1.3px] border-goth-gold/65 bg-transparent shadow-[0_0_10px_rgba(212,175,55,0.18)] mr-2">
            <Moon className="w-6 h-6 text-goth-gold/80" />
          </span>
          {/* Gold diamond ✧ at start */}
          <span className="text-goth-gold/70 text-xl font-bold mr-1">✧</span>
          <input
            type="text"
            name="astrology"
            value={form.astrology}
            onChange={onChange}
            placeholder="Partner's Essence — Astrology"
            className="flex-1 px-0 py-2 bg-transparent border-0 border-b-[1.5px] border-goth-gold/50 font-serif italic text-goth-gold tracking-[0.2em] placeholder-goth-gold/70 focus:outline-none focus:border-goth-gold/80 focus:shadow-[0_2px_12px_#d4af37ac] transition-all text-lg"
          />
          {/* Gold diamond ✧ at end */}
          <span className="text-goth-gold/70 text-xl font-bold ml-1">✧</span>
        </div>
        <div className="flex items-center gap-3 w-full group mt-1 mb-2">
          {/* Gold diamond ✧ at start */}
          <span className="text-goth-gold/70 text-xl font-bold mr-1">✧</span>
          <textarea
            name="notes"
            value={form.notes}
            onChange={onChange}
            placeholder="Alchemical Notes — Describe in stardust and gold..."
            rows={3}
            className="flex-1 px-0 py-2 bg-transparent border-0 border-b-[1.5px] border-goth-gold/40 font-serif italic text-goth-gold tracking-[0.2em] placeholder-goth-gold/40 resize-none focus:outline-none focus:border-goth-gold/80 focus:shadow-[0_2px_12px_#d4af37ac] transition-all text-lg"
          />
          {/* Gold diamond ✧ at end */}
          <span className="text-goth-gold/70 text-xl font-bold ml-1">✧</span>
        </div>
        <motion.button
          type="submit"
          className="mt-4 px-8 py-3 rounded-full font-serif tracking-[0.2em] uppercase bg-gradient-to-r from-goth-purple via-[#7e22ce] to-goth-purple text-white font-bold shadow-[0_0_25px_rgba(212,175,55,0.5)] relative overflow-visible ring-2 ring-goth-gold/60 focus:outline-none"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 40px #d4af37cc, 0 0 80px #4b006e88"
          }}
          animate={{
            boxShadow: [
              "0 0 25px rgba(212,175,55,0.5)",
              "0 0 35px rgba(212,175,55,0.7), 0 0 25px #7e22ce88",
              "0 0 25px rgba(212,175,55,0.5)"
            ]
          }}
          transition={{
            duration: 2.7,
            ease: "easeInOut",
            repeat: Infinity
          }}
          disabled={pending}
        >
          <motion.span
            className="absolute left-1/2 top-1/2 z-0 pointer-events-none"
            style={{
              translateX: "-50%",
              translateY: "-50%",
              width: '160%',
              height: '160%',
              borderRadius: '9999px',
              background: "radial-gradient(circle, #ffeeba88 0%, #d4af3755 50%, transparent 80%)",
              filter: "blur(14px)",
              opacity: 0.55
            }}
            animate={{
              opacity: [0.55, 0.88, 0.22, 0.55],
              scale: [0.65, 1.19, 1.08, 0.67],
              boxShadow: [
                "0 0 24px #fff1dc88, 0 0 0px #d4af37cc",
                "0 0 64px 32px #d4af37cc, 0 0 150px #ffeeba33",
                "0 0 24px #fff1dc88, 0 0 0px #d4af37cc"
              ]
            }}
            transition={{
              duration: 2.7,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
          <span className="relative z-10">
            {pending
              ? "Summoning..."
              : success
              ? "Bond Illuminated"
              : "TRANSMUTE BOND"}
          </span>
        </motion.button>
      </motion.form>
    </motion.div>
  );
}