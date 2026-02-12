import { useState } from "react";
import { motion } from "framer-motion";

export default function BondingScreen() {
  const [bondCode, setBondCode] = useState("");

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-goth-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="p-8 rounded-3xl shadow-2xl bg-opacity-70 bg-goth-purple/60 border-2 border-goth-gold flex flex-col items-center gap-10 max-w-md w-full">
        <h2 className="text-2xl font-bold text-goth-gold tracking-widest drop-shadow-glow mb-4">
          Enter the Bond Code
        </h2>
        <p className="text-goth-gold mb-6 text-lg text-center">
          This is your secret sanctum. Share your code or join another, and let fate weave your connection.
        </p>
        <input
          className="w-full px-6 py-3 rounded-full outline-none border-2 border-goth-gold bg-goth-bg text-goth-gold text-xl font-bold text-center focus:ring-2 focus:ring-goth-gold focus:border-goth-purple transition-all shadow-[0_0_16px_#d4af37dd] placeholder-goth-gold/50"
          placeholder="Your Bond Code"
          value={bondCode}
          onChange={e => setBondCode(e.target.value)}
          autoFocus
        />
        <button
          className="mt-4 px-8 py-3 rounded-full bg-goth-gold text-goth-bg font-bold hover:bg-goth-purple hover:text-goth-gold shadow-[0_0_20px_#d4af37] transition-all"
          disabled={!bondCode}
        >
          Link Bond
        </button>
      </div>
    </motion.div>
  );
}