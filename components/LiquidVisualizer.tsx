import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LiquidVisualizerProps {
  state: 'IDLE' | 'INPUT' | 'ANALYZING' | 'RESULT';
  colors: { start: string; end: string };
  intensity: number; // 0-100
}

export const LiquidVisualizer: React.FC<LiquidVisualizerProps> = ({ state, colors, intensity }) => {
  const [fillLevel, setFillLevel] = useState(10);
  const gradientId = "liquid-gradient"; 

  useEffect(() => {
    if (state === 'IDLE') setFillLevel(15);
    if (state === 'INPUT') setFillLevel(35);
    if (state === 'ANALYZING') setFillLevel(55);
    if (state === 'RESULT') setFillLevel(intensity > 25 ? intensity : 25);
  }, [state, intensity]);

  // Bubbles generation (Slower, fewer)
  const bubbles = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    left: Math.random() * 80 + 10,
    delay: Math.random() * 5,
    duration: Math.random() * 4 + 4, // Slower bubbles
  }));

  // Ultra smooth liquid color transition configuration using physics spring
  const springTransition = {
    type: "spring" as const,
    stiffness: 10,  // Very loose spring for fluid feel
    damping: 20,    // High damping to prevent oscillation
    mass: 1
  };

  return (
    <div className="relative w-48 h-64 md:w-64 md:h-80 mx-auto">
      {/* Glass Container Reflection/Gloss */}
      <div className="absolute inset-0 z-20 pointer-events-none rounded-b-[3rem] rounded-t-[0.5rem] border-l border-r border-b border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-[1px]">
        <div className="absolute top-0 right-5 w-3 h-full bg-gradient-to-b from-white/10 to-transparent opacity-20 rounded-full blur-[2px]"></div>
        <div className="absolute bottom-5 left-6 w-2/3 h-1/4 bg-gradient-to-t from-white/5 to-transparent opacity-10 rounded-full blur-[10px]"></div>
        {/* Rim Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
      </div>

      {/* The Liquid Container */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[3rem] rounded-t-[0.5rem] bg-white/[0.02]">
        
        {/* SVG Definition for Animated Gradient */}
        <svg width="0" height="0">
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <motion.stop 
                        offset="0%" 
                        animate={{ stopColor: colors.start }} 
                        transition={springTransition}
                    />
                    <motion.stop 
                        offset="100%" 
                        animate={{ stopColor: colors.end }} 
                        transition={springTransition}
                    />
                </linearGradient>
            </defs>
        </svg>

        {/* Liquid Body */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-10 w-full"
          initial={{ height: "10%" }}
          animate={{ height: `${fillLevel}%` }}
          transition={{ type: "spring", stiffness: 40, damping: 15 }}
        >
          {/* Wave Top Layer 1 (Back) */}
          <div className="absolute -top-6 left-0 w-[200%] h-12 flex opacity-60">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 8 }} // Slower wave
              className="w-full h-full"
            >
               <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full" style={{ fill: `url(#${gradientId})` }}>
                <path d="M0,60 C200,90 400,30 600,60 C800,90 1000,30 1200,60 L1200,100 L0,100 Z" opacity="0.6" />
              </svg>
            </motion.div>
          </div>

          {/* Wave Top Layer 2 (Front) */}
          <div className="absolute -top-5 left-0 w-[200%] h-10 flex">
            <motion.div
              animate={{ x: ["-50%", "0%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 6 }} 
              className="w-full h-full"
            >
              <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full" style={{ fill: `url(#${gradientId})` }}>
                <path d="M0,50 C150,80 350,20 500,50 C650,80 850,20 1000,50 L1000,100 L0,100 Z" />
              </svg>
            </motion.div>
          </div>

          {/* Main Liquid Color Block */}
          <motion.div 
            className="w-full h-full relative"
            animate={{ background: `linear-gradient(180deg, ${colors.start} 0%, ${colors.end} 100%)` }}
            transition={springTransition}
          >
             {/* Bubbles */}
            {state !== 'IDLE' && bubbles.map((b) => (
              <motion.div
                key={b.id}
                className="absolute rounded-full bg-white/20 backdrop-blur-sm"
                style={{
                  width: b.size,
                  height: b.size,
                  left: `${b.left}%`,
                }}
                initial={{ bottom: -20, opacity: 0 }}
                animate={{
                  bottom: "120%",
                  opacity: [0, 0.6, 0],
                  x: Math.sin(b.id) * 20 // Gentle sway
                }}
                transition={{
                  duration: b.duration,
                  repeat: Infinity,
                  delay: b.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle Glow Behind */}
      <motion.div
        className="absolute inset-0 z-[-1] rounded-b-[3rem] blur-2xl opacity-40"
        animate={{ background: `linear-gradient(to top, ${colors.end}, transparent)` }}
        transition={springTransition}
      />
    </div>
  );
};