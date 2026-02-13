import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Calendar, Clock, Sunrise, Sparkles } from "lucide-react";

/**
 * THE ECHO & STREAK - Delivery Scheduling & Streak Tracking
 * 
 * Features:
 * - Schedule delivery time (default 06:00 AM)
 * - Display current streak count with flame animation
 * - Show last delivery timestamp
 * - Connection heatmap (GitHub-style activity grid)
 * - Streak milestones with badges
 * - Display partner's crystallized alints
 */
export default function TheEchoStreak({ bondId }) {
  const [streakData, setStreakData] = useState({
    count: 0,
    lastDelivery: null,
    deliveryTime: "06:00",
    heatmapData: [],
  });
  const [partnerAlints, setPartnerAlints] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTime, setTempTime] = useState("06:00");

  useEffect(() => {
    if (bondId) {
      fetchStreakData();
      fetchPartnerEchoes();
    }
  }, [bondId]);

  const getApiUrl = () => {
    return window.location.hostname.includes('onrender.com') 
      ? 'https://aracy.onrender.com' 
      : 'http://localhost:8000';
  };

  const fetchStreakData = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/streak/${bondId}`);
      if (res.ok) {
        const data = await res.json();
        setStreakData(data);
        setTempTime(data.deliveryTime || "06:00");
      }
    } catch (err) {
      console.error("Failed to fetch streak data:", err);
    }
  };

  const fetchPartnerEchoes = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/ritual/echo`, {
        headers: {
            'X-Bond-ID': bondId
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPartnerAlints(data.alints || []);
      }
    } catch (err) {
      console.error("Failed to fetch partner echoes:", err);
    }
  };

  const updateDeliveryTime = async () => {
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/api/streak/delivery-time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bond_id: bondId,
          delivery_time: tempTime,
        }),
      });
      setStreakData({ ...streakData, deliveryTime: tempTime });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update delivery time:", err);
    }
  };

  const getStreakColor = (count) => {
    if (count >= 100) return "from-yellow-400 to-orange-500";
    if (count >= 50) return "from-orange-400 to-red-500";
    if (count >= 30) return "from-purple-400 to-pink-500";
    if (count >= 7) return "from-blue-400 to-purple-500";
    return "from-goth-purple to-goth-gold";
  };

  const getStreakMilestone = (count) => {
    if (count >= 100) return { title: "Eternal Flame", icon: "🔥👑" };
    if (count >= 50) return { title: "Cosmic Bond", icon: "✨🌌" };
    if (count >= 30) return { title: "Stellar Connection", icon: "⭐💫" };
    if (count >= 7) return { title: "Weekly Ritual", icon: "🌙✨" };
    return { title: "New Spark", icon: "✨" };
  };

  const milestone = getStreakMilestone(streakData.count);

  // Generate heatmap grid (last 12 weeks)
  const generateHeatmap = () => {
    const weeks = 12;
    const days = 7;
    const grid = [];

    for (let week = 0; week < weeks; week++) {
      const weekData = [];
      for (let day = 0; day < days; day++) {
        const date = new Date();
        date.setDate(date.getDate() - (weeks - week) * 7 + day);
        const dateStr = date.toISOString().split("T")[0];
        const activity = streakData.heatmapData?.find((d) => d.date === dateStr);
        weekData.push({
          date: dateStr,
          count: activity?.count || 0,
        });
      }
      grid.push(weekData);
    }

    return grid;
  };

  const heatmapGrid = generateHeatmap();

  const getHeatmapColor = (count) => {
    if (count === 0) return "bg-goth-bg/30 border-goth-gold/10";
    if (count === 1) return "bg-goth-purple/30 border-goth-purple/40";
    if (count === 2) return "bg-goth-purple/60 border-goth-purple/70";
    if (count >= 3) return "bg-goth-gold/80 border-goth-gold shadow-[0_0_8px_#d4af37]";
    return "bg-goth-bg/30 border-goth-gold/10";
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto p-8 rounded-3xl bg-white/5 backdrop-blur-[40px] border border-white/20 shadow-[0_0_70px_#d4af3722]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif italic font-bold text-goth-gold tracking-[0.2em] mb-2">
          THE ECHO & STREAK
        </h2>
        <p className="text-sm text-goth-gold/70 tracking-wider">
          Daily Delivery at Dawn • Connection Flame
        </p>
      </div>

      {/* Streak Display - Static Flame with Pulsating Glow */}
      <div className="flex items-center justify-center gap-8 mb-8">
        {/* Static Flame Icon with Pulsating Glow */}
        <div className="relative">
          <motion.div
            className={`w-32 h-32 rounded-full bg-gradient-to-br ${getStreakColor(
              streakData.count
            )} flex items-center justify-center`}
            animate={{
              boxShadow: [
                "0 0 30px #d4af37, inset 0 0 20px #d4af37",
                "0 0 50px #d4af37, 0 0 80px #ff6b35, inset 0 0 40px #d4af37",
                "0 0 30px #d4af37, inset 0 0 20px #d4af37",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Flame className="w-16 h-16 text-white" />
          </motion.div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-goth-bg px-4 py-1 rounded-full border-2 border-goth-gold">
            <span className="text-2xl font-bold text-goth-gold">{streakData.count}</span>
          </div>
        </div>

        {/* Milestone Badge */}
        <div className="text-center">
          <div className="text-4xl mb-2">{milestone.icon}</div>
          <p className="text-xl font-serif italic text-goth-gold">{milestone.title}</p>
          <p className="text-sm text-goth-gold/60 mt-1">
            {streakData.count} {streakData.count === 1 ? "day" : "days"} strong
          </p>
        </div>
      </div>

      {/* Partner Echoes */}
      {partnerAlints.length > 0 && (
          <div className="mb-8 p-6 rounded-2xl bg-goth-purple/10 border border-goth-gold/20">
              <h3 className="text-lg font-serif italic text-goth-gold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Echoes from the Void
              </h3>
              <p className="text-xs text-goth-gold/60 mb-4">Crystallized alints from your partner</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {partnerAlints.map((alint, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-goth-gold/30 rounded-lg">
                          <p className="text-goth-gold font-bold text-sm">{alint.word}</p>
                          <p className="text-goth-gold/60 text-xs italic">{alint.meaning}</p>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Delivery Time Settings */}
      <div className="mb-8 p-6 rounded-2xl bg-goth-bg/30 border border-goth-gold/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sunrise className="w-6 h-6 text-goth-gold" />
            <div>
              <h3 className="text-lg font-serif italic text-goth-gold">Daily Delivery Time</h3>
              <p className="text-xs text-goth-gold/60">When The Muse receives the ritual</p>
            </div>
          </div>
          {!isEditing && (
            <motion.button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-full bg-goth-gold/20 text-goth-gold text-sm font-serif border border-goth-gold/40 hover:bg-goth-gold/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Edit
            </motion.button>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-goth-gold/70" />
            <input
              type="time"
              value={tempTime}
              onChange={(e) => setTempTime(e.target.value)}
              className="flex-1 px-4 py-2 rounded-full bg-goth-bg border border-goth-gold/40 text-goth-gold focus:outline-none focus:border-goth-gold/70"
            />
            <motion.button
              onClick={updateDeliveryTime}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-goth-purple to-goth-gold text-white font-serif text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save
            </motion.button>
            <motion.button
              onClick={() => {
                setIsEditing(false);
                setTempTime(streakData.deliveryTime);
              }}
              className="px-4 py-2 rounded-full bg-goth-bg/50 text-goth-gold/70 text-sm border border-goth-gold/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-goth-gold">
            <Clock className="w-5 h-5 text-goth-gold/70" />
            <span className="text-2xl font-bold font-mono">{streakData.deliveryTime}</span>
            <span className="text-sm text-goth-gold/60">every morning</span>
          </div>
        )}
      </div>

      {/* Last Delivery */}
      {streakData.lastDelivery && (
        <div className="mb-8 flex items-center justify-center gap-2 text-goth-gold/70 text-sm">
          <Calendar className="w-4 h-4" />
          <span>
            Last delivery:{" "}
            {new Date(streakData.lastDelivery).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}

      {/* Connection Heatmap */}
      <div className="p-6 rounded-2xl bg-goth-bg/30 border border-goth-gold/20">
        <h3 className="text-lg font-serif italic text-goth-gold mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5" />
          Connection Heatmap
        </h3>
        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-1">
            {heatmapGrid.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-1">
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm border ${getHeatmapColor(day.count)}`}
                    whileHover={{ scale: 1.5 }}
                    title={`${day.date}: ${day.count} ${
                      day.count === 1 ? "delivery" : "deliveries"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-goth-gold/50">
          <span>12 weeks ago</span>
          <span>Today</span>
        </div>
      </div>
    </motion.div>
  );
}
