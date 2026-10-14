import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HistoryItem {
  question: string;
  answer: string;
}

interface FloatingHistoryProps {
  history: HistoryItem[];
  onHoverTrigger?: (x: number, y: number) => void;
}

export const FloatingHistory: React.FC<FloatingHistoryProps> = ({ history, onHoverTrigger }) => {
  // Memoize positions so they don't jump around on re-renders
  const positions = useMemo(() => {
    return history.map((_, i) => {
      // distribute items on left and right sides
      const side = i % 2 === 0 ? 'left' : 'right'; 
      const xBase = side === 'left' ? Math.random() * 15 + 2 : Math.random() * 15 + 75; 
      const yBase = Math.random() * 70 + 15; 
      
      return {
        left: `${xBase}%`,
        top: `${yBase}%`,
        duration: 20 + Math.random() * 20, 
        delay: Math.random() * 2
      };
    });
  }, [history.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    // High frequency trigger for glitch effect
    if (onHoverTrigger) { 
        onHoverTrigger(e.clientX, e.clientY);
        // Extra random particles around
        if(Math.random() > 0.5) {
            onHoverTrigger(e.clientX + (Math.random()-0.5)*50, e.clientY + (Math.random()-0.5)*50);
        }
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {history.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
          animate={{ 
            opacity: [0.4, 0.8, 0.4],
            y: [0, -10, 0],
            filter: ['blur(2px)', 'blur(0px)', 'blur(2px)']
          }}
          transition={{
            duration: positions[i].duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "linear",
            delay: positions[i].delay
          }}
          style={{
            position: 'absolute',
            left: positions[i].left,
            top: positions[i].top,
            maxWidth: '320px'
          }}
          className="pointer-events-auto cursor-pointer group"
          onMouseMove={handleMouseMove}
        >
          {/* Glitch Container */}
          <div className="relative p-4 border border-white/10 bg-black/40 backdrop-blur-sm transition-all duration-200 group-hover:border-red-500 group-hover:bg-black/80 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] group-hover:-translate-y-1">
            
            {/* Corner Accents (Cyberpunk Style) */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-transparent group-hover:border-red-500 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-transparent group-hover:border-red-500 transition-colors"></div>

            {/* Question (Pixel Font) */}
            <p className="text-sm text-cyan-400/70 mb-1 font-pixel tracking-widest uppercase group-hover:text-cyan-300 group-hover:shadow-[0_0_5px_rgba(34,211,238,0.8)] transition-all">
              {`>> MEMORY_LOG_0${i+1}`}
            </p>
            <p className="text-xs text-white/40 mb-3 font-serif italic tracking-wide group-hover:text-white/90">
                "{item.question}"
            </p>

            {/* Answer (Glitch text on hover) */}
            <div className="relative">
                <p className="text-lg text-white/70 font-serif leading-relaxed border-l-2 border-white/10 pl-3 group-hover:text-white group-hover:border-red-500 group-hover:pl-4 transition-all duration-300">
                {item.answer}
                </p>
            </div>
            
            {/* Decoration Lines */}
            <div className="absolute bottom-1 right-2 w-12 h-[2px] bg-white/5 group-hover:bg-red-500/50 transition-colors"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};