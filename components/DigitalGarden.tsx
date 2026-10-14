import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DigitalGardenProps {
  count: number;
  color: string;
  growthScale?: number; // 0.0 to 1.5+ (Hand Openness)
}

interface FlowerData {
  id: number;
  x: number; // 0-100%
  type: number; // 0-7
  scale: number;
  curve: number; // For bezier curve stem control point
  height: number;
  hueShift: number; // Variation in color
  leafType: number; // 0-2
  delay?: number;
}

interface FlowerNodeProps {
  data: FlowerData;
  baseColor: string;
  bloomScale: number; // Controls the flower head size specifically
}

const FlowerNode: React.FC<FlowerNodeProps> = ({ data, baseColor, bloomScale }) => {
  // Sway Animation (Simulated Wind)
  const swayTransition = {
    duration: 6 + Math.random() * 4, // Slower wind
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const
  };

  const renderFlowerHead = () => {
    switch (data.type) {
      case 0: // Elegant Dot & Ring
        return (
          <motion.g animate={{ rotate: [0, 10, -10, 0] }} transition={swayTransition}>
             <circle r="4" fill="currentColor" />
             <motion.circle 
                r="8" 
                stroke="currentColor" strokeWidth="0.5" fill="none"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
             />
          </motion.g>
        );
      case 1: // Curved Leaves / Abstract Tulip
        return (
          <motion.g animate={{ rotate: [-5, 5, -5] }} transition={swayTransition}>
             <path d="M0,0 Q6,-18 0,-24 Q-6,-18 0,0" fill="currentColor" opacity="0.8" />
             <path d="M0,0 Q10,-10 5,-15" stroke="currentColor" strokeWidth="0.8" fill="none" />
             <path d="M0,0 Q-10,-10 -5,-15" stroke="currentColor" strokeWidth="0.8" fill="none" />
          </motion.g>
        );
      case 2: // Floating Particles Head
        return (
          <g>
              {[1, 2, 3, 4, 5].map((i) => (
                  <motion.circle
                    key={i}
                    r={2}
                    fill="currentColor"
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: -15 - i * 8, opacity: [0, 0.7, 0], x: Math.sin(i)*6 }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.2 }}
                  />
              ))}
          </g>
        );
      case 3: // Modern Spike / Data Line
        return (
          <motion.g animate={{ rotate: [0, 5, 0] }} transition={swayTransition}>
             <line x1="0" y1="0" x2="0" y2="-20" stroke="currentColor" strokeWidth="2" />
             <circle cx="0" cy="-24" r="3" fill="white" />
             <line x1="-4" y1="-16" x2="4" y2="-16" stroke="currentColor" strokeWidth="0.8" />
          </motion.g>
        );
       case 4: // Crescent / Moon
        return (
          <motion.g 
            animate={{ rotate: 360 }} 
            transition={{ duration: 15, ease: "linear", repeat: Infinity }}
          >
            <path d="M -8 0 A 8 8 0 0 1 8 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle r="3" fill="currentColor" opacity="0.6" />
          </motion.g>
        );
      case 5: // Binary/Data Blocks
        return (
           <g>
              <rect x="-3" y="-12" width="6" height="12" fill="currentColor" opacity="0.7" />
              <rect x="-5" y="-6" width="10" height="1.5" fill="currentColor" />
              <circle cx="0" cy="-18" r="1.5" fill="white" />
           </g>
        );
      case 6: // Fractal Branch
        return (
            <motion.g animate={{ rotate: [-2, 2, -2] }} transition={swayTransition}>
                <path d="M0,0 L-6,-12 M0,0 L6,-12 M-6,-12 L-9,-18 M6,-12 L9,-18" stroke="currentColor" strokeWidth="1" />
                <circle cx="-9" cy="-18" r="2" fill="currentColor" />
                <circle cx="9" cy="-18" r="2" fill="currentColor" />
            </motion.g>
        );
      case 7: // Orbiter
         return (
             <g>
                 <circle r="5" stroke="currentColor" strokeWidth="0.8" fill="none" />
                 <motion.circle r="2" fill="white" 
                    animate={{ cx: [5, -5, 5], cy: [0, 0, 0] }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                 />
             </g>
         )
      default:
        return null;
    }
  };

  // Base physics - Fixed scale for stems (unaffected by gesture)
  const currentHeight = data.height * data.scale; 
  const currentScale = data.scale; // Static scale from random seed
  
  // Quadratic Bezier Curve for natural stem
  const stemPath = `M 0 0 Q ${data.curve} ${-currentHeight / 2} 0 ${-currentHeight}`;

  const renderLeaves = () => {
      if (data.leafType === 0) {
          return (
            <>
                <motion.path 
                    d={`M 0 ${-currentHeight * 0.3} Q ${data.curve + 10} ${-currentHeight * 0.3 - 15} ${data.curve + 5} ${-currentHeight * 0.3 - 25}`}
                    stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.5"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 1.5 }}
                />
            </>
          )
      } else if (data.leafType === 1) { 
           return (
            <>
                <line x1="0" y1={-currentHeight * 0.4} x2={data.curve + 8} y2={-currentHeight * 0.4 - 8} stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                <circle cx={data.curve + 8} cy={-currentHeight * 0.4 - 8} r="1.5" fill="currentColor" opacity="0.6" />
            </>
           )
      }
      return null;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0, filter: 'blur(0px)' }}
      animate={{ opacity: 1, scale: currentScale, filter: 'blur(0px)' }}
      exit={{ 
          opacity: 0, 
          scale: currentScale * 1.5,
          filter: 'blur(15px)',
          transition: { duration: 0.6, ease: "easeOut" } 
      }}
      transition={{ 
          type: "spring",
          stiffness: 80,
          damping: 15,
          mass: 1.2,
          delay: data.delay
      }}
      style={{
        position: 'absolute',
        left: `${data.x}%`,
        bottom: 0,
        zIndex: 10,
        pointerEvents: 'none',
        color: baseColor,
        filter: `hue-rotate(${data.hueShift}deg)`,
        transformOrigin: 'bottom center'
      }}
    >
      <svg width="150" height="500" viewBox="-75 -500 150 500" overflow="visible">
        <motion.g
            style={{ originY: 0 }}
            animate={{ rotate: [data.curve * 0.05, -data.curve * 0.05, data.curve * 0.05] }}
            transition={swayTransition}
        >
            <motion.path 
                d={stemPath}
                stroke="currentColor"
                strokeWidth={Math.max(1, currentScale * 2)}
                fill="none"
                strokeOpacity="0.7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
            />
            
            {renderLeaves()}

            <g transform={`translate(0, -${currentHeight})`}>
                {/* 
                   Gesture CONTROL: Only the flower head scales with 'bloomScale'.
                   Using a spring transition for smooth reaction to hand movement.
                */}
                <motion.g
                    animate={{ 
                        scale: bloomScale,
                        filter: bloomScale > 1.2 ? "brightness(1.3)" : "brightness(1)"
                    }}
                    transition={{ 
                        type: "spring", stiffness: 60, damping: 15
                    }}
                >
                    {renderFlowerHead()}
                </motion.g>
            </g>
        </motion.g>
      </svg>
    </motion.div>
  );
};

export const DigitalGarden: React.FC<DigitalGardenProps> = ({ count, color, growthScale = 1 }) => {
  const [flowers, setFlowers] = useState<FlowerData[]>([]);

  useEffect(() => {
    setFlowers((prev) => {
      // Logic: Maintain flowers based on input count
      if (count > prev.length) {
        const numToAdd = count - prev.length;
        const newFlowers: FlowerData[] = [];
        for (let i = 0; i < numToAdd; i++) {
          newFlowers.push({
            id: Date.now() + i + Math.random(),
            x: Math.random() * 90 + 5,
            type: Math.floor(Math.random() * 8),
            scale: 0.8 + Math.random() * 0.5,
            curve: (Math.random() - 0.5) * 60,
            height: 180 + Math.random() * 220, // Taller: 180px - 400px
            hueShift: (Math.random() - 0.5) * 50,
            leafType: Math.floor(Math.random() * 3),
            delay: i * 0.05
          });
        }
        return [...prev, ...newFlowers];
      } else if (count < prev.length) {
        return prev.slice(0, count);
      }
      return prev;
    });
  }, [count]);

  // Map the raw gesture scale (0-1.5) to a flower blooming multiplier
  // 0.3 (bud) -> 1.0 (normal) -> 1.5 (super bloom)
  const calculatedBloomScale = 0.3 + (Math.max(0, growthScale) * 0.8);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[260px] pointer-events-none z-0 overflow-hidden mix-blend-screen">
      <motion.div 
        className="absolute bottom-0 w-full h-48 blur-3xl opacity-20"
        animate={{ backgroundColor: color }}
        transition={{ duration: 2 }}
      />
      
      <AnimatePresence mode="popLayout">
        {flowers.map((flower) => (
          <FlowerNode 
            key={flower.id} 
            data={flower} 
            baseColor={color} 
            bloomScale={calculatedBloomScale} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};