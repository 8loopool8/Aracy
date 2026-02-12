import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Trophy, Star, CheckCircle, XCircle } from "lucide-react";

/**
 * THE RIDDLE - Quiz Feature with Unlockable Badges
 * 
 * Features:
 * - Interactive quiz questions about chemistry, astrology, and partner knowledge
 * - Multiple choice answers with instant feedback
 * - Unlockable badges with framed animations
 * - Score tracking and progress
 * - Badge gallery display
 */
export default function TheRiddle({ bondId, partnerName }) {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    if (bondId) {
      fetchQuizData();
      fetchUnlockedBadges();
    }
  }, [bondId]);

  const fetchQuizData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://aracy.onrender.com';
      const res = await fetch(`${apiUrl}/api/quiz/generate/${bondId}`);
      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
      }
    } catch (err) {
      console.error("Failed to fetch quiz data:", err);
    }
  };

  const fetchUnlockedBadges = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://aracy.onrender.com';
      const res = await fetch(`${apiUrl}/api/quiz/badges/${bondId}`);
      if (res.ok) {
        const data = await res.json();
        setUnlockedBadges(data.badges || []);
      }
    } catch (err) {
      console.error("Failed to fetch badges:", err);
    }
  };

  const handleAnswerSelect = async (answerIndex) => {
    if (isAnswered) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const question = quizData.questions[currentQuestion];
    const isCorrect = answerIndex === question.correctAnswer;

    if (isCorrect) {
      setScore(score + 1);

      // Check for badge unlock
      const newScore = score + 1;
      const badge = checkBadgeUnlock(newScore, quizData.questions.length);
      if (badge) {
        setShowBadgeUnlock(badge);
        await unlockBadge(badge);
      }
    }

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentQuestion < quizData.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setQuizComplete(true);
        saveQuizResults(isCorrect ? score + 1 : score);
      }
    }, 2000);
  };

  const checkBadgeUnlock = (currentScore, totalQuestions) => {
    const percentage = (currentScore / totalQuestions) * 100;

    if (percentage === 100 && !unlockedBadges.find((b) => b.id === "perfect")) {
      return { id: "perfect", name: "Perfect Harmony", icon: "👑", color: "from-yellow-400 to-orange-500" };
    }
    if (percentage >= 80 && !unlockedBadges.find((b) => b.id === "scholar")) {
      return { id: "scholar", name: "Cosmic Scholar", icon: "🌟", color: "from-purple-400 to-pink-500" };
    }
    if (percentage >= 60 && !unlockedBadges.find((b) => b.id === "seeker")) {
      return { id: "seeker", name: "Truth Seeker", icon: "🔮", color: "from-blue-400 to-purple-500" };
    }
    if (currentScore >= 1 && !unlockedBadges.find((b) => b.id === "initiate")) {
      return { id: "initiate", name: "Initiate", icon: "✨", color: "from-goth-purple to-goth-gold" };
    }

    return null;
  };

  const unlockBadge = async (badge) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://aracy.onrender.com';
      await fetch(`${apiUrl}/api/quiz/unlock-badge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bond_id: bondId,
          badge_id: badge.id,
          badge_name: badge.name,
        }),
      });
      setUnlockedBadges([...unlockedBadges, badge]);
    } catch (err) {
      console.error("Failed to unlock badge:", err);
    }
  };

  const saveQuizResults = async (finalScore) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://aracy.onrender.com';
      await fetch(`${apiUrl}/api/quiz/save-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bond_id: bondId,
          score: finalScore,
          total: quizData.questions.length,
        }),
      });
    } catch (err) {
      console.error("Failed to save quiz results:", err);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizComplete(false);
    fetchQuizData();
  };

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-16 h-16 border-4 border-goth-gold/30 border-t-goth-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (quizComplete) {
    const percentage = (score / quizData.questions.length) * 100;

    return (
      <motion.div
        className="w-full max-w-2xl mx-auto p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="rounded-3xl bg-white/5 backdrop-blur-[40px] border border-white/20 shadow-[0_0_70px_#d4af3722] p-8 text-center">
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-goth-gold to-goth-purple shadow-[0_0_40px_#d4af37] mb-6"
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 40px #d4af37",
                "0 0 60px #d4af37, 0 0 100px #7e22ce",
                "0 0 40px #d4af37",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-4xl font-serif italic font-bold text-goth-gold tracking-[0.2em] mb-4">
            Quiz Complete!
          </h2>

          <div className="mb-6">
            <p className="text-6xl font-bold text-goth-gold mb-2">
              {score} / {quizData.questions.length}
            </p>
            <p className="text-xl text-goth-gold/70">{percentage.toFixed(0)}% Correct</p>
          </div>

          {/* Badge Gallery */}
          <div className="mb-8">
            <h3 className="text-xl font-serif italic text-goth-gold mb-4">Unlocked Badges</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {unlockedBadges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${badge.color} flex flex-col items-center justify-center shadow-[0_0_20px_#d4af37] border-2 border-goth-gold`}
                >
                  <span className="text-3xl mb-1">{badge.icon}</span>
                  <span className="text-xs text-white font-serif">{badge.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.button
            onClick={resetQuiz}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-goth-purple to-goth-gold text-white font-serif tracking-[0.2em] uppercase shadow-[0_0_25px_rgba(212,175,55,0.5)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const question = quizData.questions[currentQuestion];

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Badge Unlock Animation */}
      <AnimatePresence>
        {showBadgeUnlock && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBadgeUnlock(null)}
          >
            <motion.div
              className={`w-64 h-64 rounded-3xl bg-gradient-to-br ${showBadgeUnlock.color} flex flex-col items-center justify-center shadow-[0_0_80px_#d4af37] border-4 border-goth-gold`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {showBadgeUnlock.icon}
              </motion.div>
              <p className="text-2xl font-serif italic text-white text-center px-4">
                {showBadgeUnlock.name}
              </p>
              <p className="text-sm text-white/70 mt-2">Badge Unlocked!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Card */}
      <div className="rounded-3xl bg-white/5 backdrop-blur-[40px] border border-white/20 shadow-[0_0_70px_#d4af3722] p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-goth-gold" />
            <div>
              <h2 className="text-2xl font-serif italic font-bold text-goth-gold tracking-[0.2em]">
                THE RIDDLE
              </h2>
              <p className="text-sm text-goth-gold/70">Test Your Bond Knowledge</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-goth-gold/70">Question</p>
            <p className="text-2xl font-bold text-goth-gold">
              {currentQuestion + 1} / {quizData.questions.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-goth-bg/50 rounded-full border border-goth-gold/30 overflow-hidden mb-8">
          <motion.div
            className="h-full bg-gradient-to-r from-goth-purple to-goth-gold"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-xl font-serif text-goth-gold mb-6 leading-relaxed">
            {question.question}
          </h3>

          {/* Answers */}
          <div className="space-y-3">
            {question.answers.map((answer, index) => {
              const isCorrect = index === question.correctAnswer;
              const isSelected = selectedAnswer === index;
              const showResult = isAnswered;

              let bgClass = "bg-goth-bg/50 border-goth-gold/30 text-goth-gold";
              if (showResult) {
                if (isSelected && isCorrect) {
                  bgClass = "bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-white shadow-[0_0_20px_#10b981]";
                } else if (isSelected && !isCorrect) {
                  bgClass = "bg-gradient-to-r from-red-500 to-rose-500 border-red-400 text-white shadow-[0_0_20px_#ef4444]";
                } else if (isCorrect) {
                  bgClass = "bg-gradient-to-r from-green-500/50 to-emerald-500/50 border-green-400/50 text-white";
                }
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={`w-full px-6 py-4 rounded-2xl border-2 font-serif text-left transition-all ${bgClass} ${
                    !isAnswered ? "hover:border-goth-gold/70 hover:shadow-[0_0_15px_#d4af3733]" : ""
                  }`}
                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <span>{answer}</span>
                    {showResult && (
                      <span>
                        {isSelected && isCorrect && <CheckCircle className="w-6 h-6" />}
                        {isSelected && !isCorrect && <XCircle className="w-6 h-6" />}
                        {!isSelected && isCorrect && <Star className="w-6 h-6" />}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Score Display */}
        <div className="mt-8 text-center">
          <p className="text-sm text-goth-gold/70">Current Score</p>
          <p className="text-3xl font-bold text-goth-gold">{score}</p>
        </div>
      </div>
    </motion.div>
  );
}
