import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TypingParticlesRef {
  spawn: () => void;
  spawnAt: (x: number, y: number) => void;
}

export const TypingParticles = forwardRef<TypingParticlesRef>((_, ref) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; color: string }[]>([]);

  useImperativeHandle(ref, () => ({
    spawn: () => {
      spawnParticle(Math.random() * 100, Math.random() * 100);
    },
    spawnAt: (mouseX: number, mouseY: number) => {
      // Convert pixel coordinates to percentage
      const xPercent = (mouseX / window.innerWidth) * 100;
      const yPercent = (mouseY / window.innerHeight) * 100;
      spawnParticle(xPercent, yPercent, true);
    }
  }));

  const spawnParticle = (x: number, y: number, isInteraction = false) => {
      const id = Date.now() + Math.random();
      // More gold/ethereal colors for interaction
      const colors = isInteraction 
        ? ['#fcd34d', '#ffffff', '#fbbf24'] 
        : ['#a5f3fc', '#c084fc', '#ffffff', '#fcd34d'];
      
      const newParticle = {
        id,
        x: x + (Math.random() - 0.5) * (isInteraction ? 2 : 10), // Tighter spread for mouse
        y: y + (Math.random() - 0.5) * (isInteraction ? 2 : 10), 
        size: Math.random() * (isInteraction ? 3 : 10) + (isInteraction ? 2 : 4),
        color: colors[Math.floor(Math.random() * colors.length)]
      };

      setParticles(prev => [...prev.slice(-40), newParticle]);
      
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== id));
      }, isInteraction ? 1000 : 2000);
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0, left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ 
                opacity: [0, 0.8, 0], 
                scale: [0.5, 1.5, 0], 
                y: -50, // Float up
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ 
                width: p.size, 
                height: p.size, 
                backgroundColor: p.color,
                boxShadow: `0 0 15px ${p.color}`,
                position: 'absolute'
            }}
            className="rounded-full"
          />
        ))}
      </AnimatePresence>
    </div>
  );
});