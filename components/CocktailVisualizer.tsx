
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MoodRecipe } from '../types';
import { audioEngine } from '../services/audioEngine';

interface CocktailVisualizerProps {
  recipe: MoodRecipe;
}

export const CocktailVisualizer: React.FC<CocktailVisualizerProps> = ({ recipe }) => {
  const baseColor = recipe.colorHex;
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);
  const [isStirring, setIsStirring] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to center of the container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Reduced rotation range for subtler 3D feel
    const rotateY = ((x - centerX) / centerX) * 10; // Reduced from 20 to 10
    const rotateX = ((centerY - y) / centerY) * 8;  // Reduced from 15 to 8

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setHoveredLayer(null);
  };

  const handleClick = () => {
      if (!isStirring) {
          setIsStirring(true);
          audioEngine.playSFX('stir');
          setTimeout(() => setIsStirring(false), 2000);
      }
  };

  const handleLayerHover = (id: string) => {
    if (hoveredLayer !== id) {
        setHoveredLayer(id);
        audioEngine.playSFX('liquid_hover');
    }
  };

  const getLayerStyle = (index: number, type: 'liquid' | 'ice', id: string) => {
    const opacity = 0.6 + (index * 0.04); 
    const isIce = type === 'ice';
    const isHovered = hoveredLayer === id;
    const isDimmed = hoveredLayer !== null && !isHovered;

    return {
      backgroundColor: isIce ? 'rgba(255, 255, 255, 0.15)' : baseColor,
      opacity: isDimmed ? 0.2 : (isIce ? 0.4 : opacity),
      filter: isIce ? 'blur(0.5px)' : `hue-rotate(${index * 5}deg) brightness(${isHovered ? 1.3 : 1}) contrast(1.1)`,
      boxShadow: isHovered 
        ? 'inset 0 0 40px rgba(255,255,255,0.5)' 
        : (isIce ? 'inset 0 0 10px rgba(255,255,255,0.2)' : 'inset 0 0 20px rgba(0,0,0,0.3)'),
      transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
    };
  };

  const layers = [
    { id: 'week', label: 'L7 星期 (Style)', name: recipe.layers.week.ingredient, type: 'ice' }, 
    { id: 'zodiac', label: 'L6 星座 (Garnish)', name: recipe.layers.zodiac.ingredient, type: 'liquid' }, 
    { id: 'color', label: 'L5 视觉 (Color)', name: recipe.layers.color.ingredient, type: 'liquid' },
    { id: 'taste', label: 'L4 风味 (Taste)', name: recipe.layers.taste.ingredient, type: 'liquid' },
    { id: 'event', label: 'L3 经历 (Mixer)', name: recipe.layers.event.ingredient, type: 'liquid' },
    { id: 'luck', label: 'L2 运势 (Luck)', name: recipe.layers.luck.ingredient, type: 'liquid' },
    { id: 'emotion', label: 'L1 基酒 (Base)', name: recipe.layers.emotion.alcoholType, type: 'liquid' }, 
  ];

  const drops = Array.from({ length: 10 }).map((_, i) => ({
      top: Math.random() * 80 + 10 + '%',
      left: Math.random() * 90 + 5 + '%',
      size: Math.random() * 2 + 2 + 'px',
      delay: Math.random() * 2
  }));

  const iceCubes = Array.from({ length: 3 }).map((_, i) => ({
      top: 15 + Math.random() * 40 + '%',
      left: 15 + Math.random() * 60 + '%',
      rotate: Math.random() * 360 + 'deg',
      size: 25 + Math.random() * 15 + 'px'
  }));

  return (
    <div 
        ref={containerRef}
        className="relative flex items-center justify-center w-full h-full min-h-[500px] perspective-[1200px] cursor-pointer pr-64 pl-10"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
    >
      
      {/* Table Caustics (Reflection on surface) */}
      <motion.div 
        className="absolute bottom-16 left-[calc(50%-4rem)] w-48 h-16 rounded-full blur-2xl opacity-50 mix-blend-screen pointer-events-none"
        animate={{ 
            x: -rotation.y * 3, // Move opposite to glass
            scaleX: 1 + Math.abs(rotation.y) * 0.01
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{ background: `radial-gradient(circle, ${baseColor}, transparent 80%)` }}
      />

      <motion.div 
        className="relative w-32 h-80 z-10 transform-style-3d"
        animate={{ 
            rotateX: rotation.x, 
            rotateY: rotation.y,
            rotateZ: isStirring ? [0, 5, -5, 5, -5, 0] : 0
        }}
        transition={isStirring ? { duration: 0.5, type: 'tween', ease: 'easeInOut' } : { type: 'spring', stiffness: 150, damping: 20, mass: 0.8 }}
      >
        
        {/* Glass Container Body */}
        <div className="absolute inset-0 z-30 pointer-events-none rounded-b-[2rem] border-x border-b-[4px] border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_30px_rgba(255,255,255,0.05)] backdrop-blur-[3px] overflow-hidden">
           
           {/* Dynamic Highlights (Sheen) */}
           <motion.div 
              className="absolute top-0 -left-[50%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
              animate={{ x: rotation.y * 4 }} // Highlights move with rotation
           />
           <div className="absolute top-4 left-2 w-2 h-[85%] bg-gradient-to-b from-white/50 to-transparent rounded-full blur-[2px] opacity-90 mix-blend-overlay"></div>
           <div className="absolute top-4 right-2 w-0.5 h-[85%] bg-gradient-to-b from-white/30 to-transparent rounded-full blur-[1px] opacity-60 mix-blend-overlay"></div>
           
           {/* Condensation Drops */}
           {drops.map((d, i) => (
               <motion.div 
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 2 + d.delay, duration: 2 }}
                    className="absolute bg-white rounded-full shadow-sm blur-[0.3px]"
                    style={{ top: d.top, left: d.left, width: d.size, height: d.size }}
               />
           ))}
        </div>

        {/* Thick Glass Base */}
        <div className="absolute -bottom-3 left-3 right-3 h-5 bg-white/20 rounded-b-[1rem] blur-[2px] z-0 shadow-[0_5px_15px_rgba(0,0,0,0.5)]"></div>

        {/* Liquid Stack */}
        <div className="absolute inset-x-[3px] bottom-[4px] top-[2px] z-10 flex flex-col-reverse overflow-hidden rounded-b-[1.8rem] opacity-95">
            {layers.map((layer, index) => (
                <motion.div
                    key={layer.id}
                    initial={{ height: 0 }}
                    animate={{ height: '14.28%' }}
                    transition={{ delay: 0.5 + index * 0.15, duration: 1.5, type: 'spring', bounce: 0 }}
                    className="relative w-full border-t border-white/5 backdrop-blur-[1px] pointer-events-auto"
                    style={getLayerStyle(index, layer.type as any, layer.id)}
                    onMouseEnter={() => handleLayerHover(layer.id)}
                >
                    {/* Liquid shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-20 transform -skew-x-12"></div>
                </motion.div>
            ))}
        </div>

        {/* Ice Cubes */}
        <div className="absolute inset-x-[4px] bottom-[6px] top-[2px] z-10 overflow-hidden rounded-b-[2.2rem] pointer-events-none">
             {iceCubes.map((ice, i) => (
                 <motion.div
                    key={i}
                    initial={{ y: 150, opacity: 0 }}
                    animate={{ 
                        y: 0, 
                        opacity: 0.7,
                        rotate: isStirring ? [0, 360] : 0 
                    }}
                    transition={{ delay: 1.5 + i * 0.5, duration: isStirring ? 1 : 2.5, type: 'spring' }}
                    className="absolute bg-white/20 border border-white/30 backdrop-blur-md rounded shadow-lg"
                    style={{ top: ice.top, left: ice.left, width: ice.size, height: ice.size, rotate: ice.rotate }}
                 />
             ))}
        </div>

        {/* Interactive Connecting Labels */}
        <div className="absolute top-0 left-[90%] pl-6 h-full flex flex-col-reverse justify-between py-6 w-80 pointer-events-none z-50">
             {layers.map((layer, index) => (
                 <motion.div
                    key={`label-${layer.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                        opacity: (hoveredLayer === null || hoveredLayer === layer.id) ? 1 : 0.2,
                        x: hoveredLayer === layer.id ? 10 : 0,
                        scale: hoveredLayer === layer.id ? 1.05 : 1
                    }}
                    transition={{ delay: 2 + index * 0.1, duration: 0.4 }}
                    className="flex items-center h-[14.28%]"
                 >
                     {/* Connecting Line */}
                     <div className={`h-[1px] transition-all duration-300 mr-3 relative ${hoveredLayer === layer.id ? 'bg-white w-16' : 'bg-white/20 w-8'}`}>
                        <div className={`absolute left-0 w-1.5 h-1.5 bg-white shadow-[0_0_5px_white] rounded-full -translate-x-1/2 -translate-y-1/2 top-1/2`}></div>
                     </div>
                     
                     {/* Label Card */}
                     <div className={`text-left backdrop-blur-md p-3 rounded-lg border transition-all duration-300 pointer-events-auto min-w-[180px]
                        ${hoveredLayer === layer.id 
                            ? 'bg-white/10 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.15)] translate-x-2' 
                            : 'bg-black/40 border-white/5'}
                     `}>
                         <div className="text-[10px] text-white/50 uppercase tracking-widest mb-0.5 flex items-center gap-2">
                             {layer.label.split(' ')[0]} <span className="text-white/30">|</span> {layer.label.split(' ')[1]}
                         </div>
                         <div className="text-sm text-white font-serif leading-tight">{layer.name}</div>
                     </div>
                 </motion.div>
             ))}
        </div>

        {/* Enhanced Garnish: Dried Orange & Rosemary */}
        <motion.div 
            initial={{ y: -80, opacity: 0, rotate: -45 }}
            animate={{ y: -30, opacity: 1, rotate: -10 }}
            transition={{ delay: 3.5, type: 'spring', damping: 15 }}
            className="absolute -top-10 -right-10 z-50 pointer-events-none"
        >
            {/* Dried Orange Slice */}
            <div className="relative w-16 h-16 rounded-full border border-orange-300/40 shadow-lg overflow-hidden bg-orange-900/40 backdrop-blur-sm">
                 <div className="absolute inset-1 rounded-full border border-orange-200/30"></div>
                 {/* Flesh Segments */}
                 <div className="absolute inset-0" 
                      style={{ 
                          background: `conic-gradient(from 0deg, transparent 0deg, transparent 10deg, rgba(253, 186, 116, 0.2) 15deg, rgba(253, 186, 116, 0.2) 45deg, transparent 50deg)`,
                          backgroundSize: '100% 100%'
                      }}>
                 </div>
                  <div className="absolute inset-0 rotate-180" 
                      style={{ 
                          background: `conic-gradient(from 0deg, transparent 0deg, transparent 10deg, rgba(253, 186, 116, 0.2) 15deg, rgba(253, 186, 116, 0.2) 45deg, transparent 50deg)`,
                      }}>
                 </div>
                 {/* Pith Center */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-100/20 rounded-full blur-[1px]"></div>
            </div>
            
            {/* Rosemary Sprig */}
             <div className="absolute top-1/2 -left-4 w-20 h-28 border-l-2 border-emerald-700/60 rounded-[100%] origin-bottom rotate-[45deg] -z-10 filter drop-shadow-lg">
                 {/* Leaves */}
                 {[1,2,3,4].map(i => (
                     <div key={i} className="absolute w-3 h-0.5 bg-emerald-600/60 rounded-full" 
                          style={{ top: `${i*15}%`, left: '-2px', transform: 'rotate(-45deg)' }}></div>
                 ))}
                 {[1,2,3,4].map(i => (
                     <div key={`r-${i}`} className="absolute w-3 h-0.5 bg-emerald-600/60 rounded-full" 
                          style={{ top: `${i*15 + 5}%`, left: '-10px', transform: 'rotate(225deg)' }}></div>
                 ))}
             </div>
        </motion.div>

      </motion.div>
    </div>
  );
};
