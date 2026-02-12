import { motion } from "framer-motion";

const PARTICLE_COUNT = 24;
const PALETTE = ["#d4af37", "#fff7e6", "#4b006e", "#a68fe6", "#ffffff80"];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function Stardust() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(PARTICLE_COUNT)].map((_, i) => {
        const size = random(2, 6);
        const left = random(0, 100);
        const top = random(0, 100);
        const color = PALETTE[Math.floor(random(0, PALETTE.length))];
        const duration = random(9, 24);
        const delay = random(0, 12);

        return (
          <motion.div
            key={i}
            initial={{
              opacity: 0.6,
              scale: random(0.7, 1.1),
              filter: `blur(${random(0.5, 2.5)}px)`
            }}
            animate={{
              y: [0, random(-40, +40), 0],
              opacity: [0.7, 1, 0.8, 0.55, 0.76],
              scale: [1, random(0.6, 1.2), 1]
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration,
              delay
            }}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 ${2 + size * 2}px ${color}`
            }}
          />
        );
      })}
      {/* Decorative: subtle gradient for cosmic look */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0c] via-[#23164455] to-[#4b006e44]"></div>
    </div>
  );
}

export default Stardust;