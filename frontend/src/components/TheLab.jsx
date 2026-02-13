import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Languages, Palette } from "lucide-react";

/**
 * THE LAB - AI Generation Panel
 * 
 * Features:
 * - Catalyst Keywords: User can add custom keywords to influence generation
 * - Custom Vibe: Freeform text input for mood/tone
 * - Style Presets: Quick-select buttons (Silly, Deep, Astro, Poetic, Scientific)
 * - Language Search: Multi-language support for alints
 * - Real-time generation with loading states
 */
export default function TheLab({ onGenerate, isGenerating }) {
  const [catalystKeywords, setCatalystKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [customVibe, setCustomVibe] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("deep");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const stylePresets = [
    { id: "silly", label: "Silly", icon: "🎭", color: "from-pink-500 to-purple-500" },
    { id: "deep", label: "Deep", icon: "🌊", color: "from-purple-600 to-indigo-600" },
    { id: "astro", label: "Astro", icon: "✨", color: "from-indigo-500 to-purple-500" },
    { id: "poetic", label: "Poetic", icon: "📜", color: "from-purple-500 to-pink-500" },
    { id: "scientific", label: "Scientific", icon: "⚗️", color: "from-blue-500 to-purple-500" },
  ];

  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ro", label: "Română", flag: "🇷🇴" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "it", label: "Italiano", flag: "🇮🇹" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "la", label: "Latin", flag: "🏛️" },
    { code: "grc", label: "Ancient Greek", flag: "🏺" },
    { code: "sa", label: "Sanskrit", flag: "🕉️" },
    { code: "ar", label: "Arabic", flag: "🇸🇦" },
    { code: "he", label: "Hebrew", flag: "🇮🇱" },
    { code: "ja", label: "Japanese", flag: "🇯🇵" },
    { code: "zh", label: "Chinese", flag: "🇨🇳" },
    { code: "ru", label: "Russian", flag: "🇷🇺" },
    { code: "pt", label: "Portuguese", flag: "🇵🇹" },
    { code: "nl", label: "Dutch", flag: "🇳🇱" },
  ];

  const [languageSearch, setLanguageSearch] = useState("");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const filteredLanguages = languages.filter((lang) =>
    lang.label.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const addKeyword = () => {
    if (keywordInput.trim() && catalystKeywords.length < 5) {
      setCatalystKeywords([...catalystKeywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (index) => {
    setCatalystKeywords(catalystKeywords.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    const payload = {
      style: selectedStyle,
      language: selectedLanguage,
      catalysts: catalystKeywords,
      vibe: customVibe,
    };
    onGenerate(payload);
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-8 rounded-3xl bg-white/5 backdrop-blur-[40px] border border-white/20 shadow-[0_0_70px_#d4af3722]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-goth-gold to-goth-purple shadow-[0_0_20px_#d4af37]">
          <Wand2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-serif italic font-bold text-goth-gold tracking-[0.2em]">
            THE LAB
          </h2>
          <p className="text-sm text-goth-gold/70 tracking-wider">Alchemical Generation Engine</p>
        </div>
      </div>

      {/* Style Presets */}
      <div className="mb-6">
        <label className="block text-goth-gold font-serif italic mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Style Essence
        </label>
        <div className="flex flex-wrap gap-3">
          {stylePresets.map((preset) => (
            <motion.button
              key={preset.id}
              onClick={() => setSelectedStyle(preset.id)}
              className={`px-4 py-2 rounded-full font-serif text-sm transition-all ${
                selectedStyle === preset.id
                  ? `bg-gradient-to-r ${preset.color} text-white shadow-[0_0_20px_#d4af37]`
                  : "bg-goth-bg/50 text-goth-gold/70 border border-goth-gold/30"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">{preset.icon}</span>
              {preset.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Catalyst Keywords */}
      <div className="mb-6">
        <label className="block text-goth-gold font-serif italic mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Catalyst Keywords <span className="text-xs text-goth-gold/50">(max 5)</span>
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addKeyword()}
            placeholder="Add a keyword..."
            className="flex-1 px-4 py-2 rounded-full bg-goth-bg/50 border border-goth-gold/30 text-goth-gold placeholder-goth-gold/50 focus:outline-none focus:border-goth-gold/70 focus:shadow-[0_0_15px_#d4af3733]"
            disabled={catalystKeywords.length >= 5}
          />
          <motion.button
            onClick={addKeyword}
            disabled={!keywordInput.trim() || catalystKeywords.length >= 5}
            className="px-6 py-2 rounded-full bg-goth-gold text-goth-bg font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add
          </motion.button>
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {catalystKeywords.map((keyword, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-goth-purple to-goth-gold/80 text-white text-sm font-serif flex items-center gap-2 shadow-[0_0_10px_#d4af3755]"
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(index)}
                  className="text-white/80 hover:text-white"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom Vibe */}
      <div className="mb-6">
        <label className="block text-goth-gold font-serif italic mb-3">
          Custom Vibe <span className="text-xs text-goth-gold/50">(optional)</span>
        </label>
        <textarea
          value={customVibe}
          onChange={(e) => setCustomVibe(e.target.value)}
          placeholder="Describe the mood, tone, or feeling you want to evoke..."
          rows={3}
          className="w-full px-4 py-3 rounded-2xl bg-goth-bg/50 border border-goth-gold/30 text-goth-gold placeholder-goth-gold/50 focus:outline-none focus:border-goth-gold/70 focus:shadow-[0_0_15px_#d4af3733] resize-none font-serif"
        />
      </div>

      {/* Language Selection - Searchable Dropdown */}
      <div className="mb-8 relative">
        <label className="block text-goth-gold font-serif italic mb-3 flex items-center gap-2">
          <Languages className="w-4 h-4" />
          Language Essence
        </label>
        
        {/* Selected Language Display */}
        <div
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          className="w-full px-4 py-3 rounded-xl bg-black/40 border-2 border-goth-gold/40 text-goth-gold cursor-pointer flex items-center justify-between hover:border-goth-gold/70 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {languages.find((l) => l.code === selectedLanguage)?.flag}
            </span>
            <span className="font-serif">
              {languages.find((l) => l.code === selectedLanguage)?.label}
            </span>
          </div>
          <motion.div
            animate={{ rotate: showLanguageDropdown ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            ▼
          </motion.div>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {showLanguageDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 rounded-xl bg-black/95 border-2 border-goth-gold/60 shadow-[0_0_30px_#d4af37] max-h-80 overflow-hidden"
            >
              {/* Search Input */}
              <div className="p-3 border-b border-goth-gold/30">
                <input
                  type="text"
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  placeholder="Search languages..."
                  className="w-full px-3 py-2 rounded-lg bg-goth-bg/50 border border-goth-gold/30 text-goth-gold placeholder-goth-gold/50 focus:outline-none focus:border-goth-gold/70 text-sm"
                  autoFocus
                />
              </div>

              {/* Language List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredLanguages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      setShowLanguageDropdown(false);
                      setLanguageSearch("");
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-goth-gold/20 transition-all ${
                      selectedLanguage === lang.code
                        ? "bg-goth-gold/30 text-goth-gold"
                        : "text-goth-gold/80"
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-serif text-sm">{lang.label}</span>
                  </motion.button>
                ))}
                {filteredLanguages.length === 0 && (
                  <div className="px-4 py-8 text-center text-goth-gold/50 text-sm italic">
                    No languages found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mystical Seal Transmute Button */}
      <motion.button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="relative w-full h-40 rounded-2xl font-serif tracking-[0.2em] uppercase text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden border-4 border-goth-gold"
        whileHover={!isGenerating ? { scale: 1.02 } : {}}
        whileTap={!isGenerating ? { scale: 0.98 } : {}}
        style={{
          background: "radial-gradient(circle at center, #4b006e 0%, #2d0052 50%, #1a0033 100%)",
        }}
      >
        {/* Pulsating Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "inset 0 0 50px #d4af37, 0 0 50px #d4af37",
              "inset 0 0 80px #d4af37, 0 0 80px #d4af37, 0 0 120px #7e22ce",
              "inset 0 0 50px #d4af37, 0 0 50px #d4af37",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Mystical Seal Pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15">
          <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
            {/* Outer circle */}
            <circle cx="70" cy="70" r="65" stroke="#d4af37" strokeWidth="2" fill="none" />
            <circle cx="70" cy="70" r="55" stroke="#d4af37" strokeWidth="1" fill="none" />
            
            {/* Pentagram */}
            <path d="M70,15 L85,55 L125,55 L92,80 L105,120 L70,95 L35,120 L48,80 L15,55 L55,55 Z" 
                  stroke="#d4af37" strokeWidth="2" fill="none" />
            
            {/* Center circle */}
            <circle cx="70" cy="70" r="20" stroke="#d4af37" strokeWidth="1.5" fill="none" />
            
            {/* Alchemical symbols */}
            <circle cx="70" cy="15" r="5" fill="#d4af37" />
            <circle cx="125" cy="55" r="5" fill="#d4af37" />
            <circle cx="105" cy="120" r="5" fill="#d4af37" />
            <circle cx="35" cy="120" r="5" fill="#d4af37" />
            <circle cx="15" cy="55" r="5" fill="#d4af37" />
          </svg>
        </div>

        {/* Button Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3">
          {isGenerating ? (
            <>
              <motion.div
                className="w-16 h-16 border-4 border-goth-gold/30 border-t-goth-gold rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-base">Transmuting Alints...</span>
            </>
          ) : (
            <>
              <motion.div
                className="text-6xl"
                animate={{
                  scale: [1, 1.15, 1],
                  filter: [
                    "drop-shadow(0 0 10px #d4af37)",
                    "drop-shadow(0 0 25px #d4af37)",
                    "drop-shadow(0 0 10px #d4af37)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                🔮
              </motion.div>
              <span className="text-xl">TRANSMUTE 19 ALINTS</span>
              <span className="text-xs text-goth-gold/70 tracking-wider">The Mystical Seal</span>
            </>
          )}
        </div>

        {/* Ornate Corner Decorations */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-goth-gold"></div>
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-goth-gold"></div>
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-goth-gold"></div>
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-goth-gold"></div>
      </motion.button>
    </motion.div>
  );
}