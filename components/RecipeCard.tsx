
import React from 'react';
import { motion } from 'framer-motion';
import { MoodRecipe } from '../types';
import { Share2, RefreshCw, Bookmark, Layers, Clover, Calendar, Palette, Heart, Star, Sun, Sliders } from 'lucide-react';
import { CocktailVisualizer } from './CocktailVisualizer';

interface RecipeCardProps {
  recipe: MoodRecipe;
  onReset: () => void;
  onTune?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onReset, onTune }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-7xl min-h-[80vh] mx-auto mt-4 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row relative z-50"
    >
      
      {/* LEFT: Text Content (Magazine Style) */}
      <div className="flex-1 lg:max-w-[40%] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col bg-gradient-to-b from-white/[0.03] to-transparent relative z-20">
          
          {/* Header Section */}
          <div className="p-8 lg:p-10 pb-4">
            <div className="flex items-center gap-3 mb-4 opacity-50">
                <div className="h-[1px] w-8 bg-white"></div>
                <span className="text-[10px] uppercase tracking-[0.4em]">Mood Mixology Analysis</span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-serif text-white mb-4 leading-tight tracking-wide drop-shadow-lg">
              {recipe.name}
            </h2>
            <p className="text-white/60 text-sm italic font-light leading-relaxed border-l-2 border-white/20 pl-4 mb-4">
              "{recipe.description}"
            </p>

            {/* Quick Action Pill Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {onTune && (
                <button
                  onClick={onTune}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 hover:from-cyan-400 hover:to-blue-400 border border-cyan-400/60 hover:border-cyan-300 text-cyan-300 hover:text-black rounded-lg text-xs font-pixel tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Sliders size={14} className="animate-pulse" />
                  <span>[ 调整配方 TUNE ]</span>
                </button>
              )}
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/20 border border-white/10 text-white/60 hover:text-white rounded-lg text-xs font-pixel tracking-wider transition-all cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>重新调制 RESET</span>
              </button>
            </div>
          </div>

          {/* Scrollable Analysis Area */}
          <div className="px-8 lg:px-10 flex-grow overflow-y-auto no-scrollbar space-y-6 pb-8">
            
            {/* Layer 1: Base - Hero Item */}
            <div className="group relative">
                <div className="text-[10px] text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Heart size={10} /> Emotion Base
                </div>
                <h3 className="text-xl text-white font-medium mb-1">{recipe.layers.emotion.alcoholType}</h3>
                <p className="text-xs text-white/40 mb-2">{recipe.layers.emotion.name}</p>
                <p className="text-sm text-white/70 font-light leading-relaxed">
                    {recipe.layers.emotion.description}
                </p>
            </div>

            <div className="w-full h-[1px] bg-white/5"></div>

            {/* Grid for details */}
            <div className="grid grid-cols-1 gap-6">
                {/* Luck & Event */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-amber-400/80">
                            <Clover size={10} />
                            <span className="text-[9px] uppercase tracking-wider">Luck</span>
                        </div>
                        <p className="text-sm text-white font-medium">{recipe.layers.luck.ingredient}</p>
                        <p className="text-[11px] text-white/50 mt-1 font-light leading-snug">{recipe.layers.luck.description}</p>
                    </div>
                    <div>
                         <div className="flex items-center gap-2 mb-1 text-emerald-400/80">
                            <Calendar size={10} />
                            <span className="text-[9px] uppercase tracking-wider">Event</span>
                        </div>
                        <p className="text-sm text-white font-medium">{recipe.layers.event.ingredient}</p>
                        <p className="text-[11px] text-white/50 mt-1 font-light leading-snug">{recipe.layers.event.description}</p>
                    </div>
                </div>

                {/* Taste & Color */}
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-rose-400/80">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/></svg>
                            <span className="text-[9px] uppercase tracking-wider">Taste</span>
                        </div>
                        <p className="text-sm text-white font-medium">{recipe.layers.taste.ingredient}</p>
                        <p className="text-[11px] text-white/50 mt-1 font-light leading-snug">{recipe.layers.taste.notes}</p>
                    </div>
                    <div>
                         <div className="flex items-center gap-2 mb-1 text-pink-400/80">
                            <Palette size={10} />
                            <span className="text-[9px] uppercase tracking-wider">Visual</span>
                        </div>
                        <p className="text-sm text-white font-medium">{recipe.layers.color.ingredient}</p>
                        <p className="text-[11px] text-white/50 mt-1 font-light leading-snug">{recipe.layers.color.meaning}</p>
                    </div>
                </div>

                 {/* Zodiac & Week */}
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-purple-400/80">
                            <Star size={10} />
                            <span className="text-[9px] uppercase tracking-wider">Zodiac</span>
                        </div>
                        <p className="text-sm text-white font-medium">{recipe.layers.zodiac.ingredient}</p>
                        <p className="text-[11px] text-white/50 mt-1 font-light leading-snug">{recipe.layers.zodiac.prediction}</p>
                    </div>
                    <div>
                         <div className="flex items-center gap-2 mb-1 text-blue-400/80">
                            <Sun size={10} />
                            <span className="text-[9px] uppercase tracking-wider">Style</span>
                        </div>
                        <p className="text-sm text-white font-medium">{recipe.layers.week.ingredient}</p>
                        <p className="text-[11px] text-white/50 mt-1 font-light leading-snug">{recipe.layers.week.vibe}</p>
                    </div>
                </div>
            </div>

          </div>

          {/* Footer Stats */}
          <div className="bg-black/30 p-6 flex flex-wrap justify-between items-center border-t border-white/5 mt-auto backdrop-blur-sm gap-4">
            <div>
                <span className="text-white/30 text-[9px] uppercase tracking-widest block mb-0.5">Spirit Intensity</span>
                <span className="font-serif text-2xl text-white tracking-tighter">{recipe.stats.abvDisplay}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {onTune && (
                <button 
                  onClick={onTune}
                  className="flex items-center gap-2 px-3.5 py-2 bg-cyan-950/60 hover:bg-cyan-400 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 hover:text-black rounded-lg text-xs font-pixel tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
                >
                  <Sliders size={13} />
                  <span>[ 调整配方 TUNE ]</span>
                </button>
              )}
              <button 
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white border border-white/10 text-white hover:text-black rounded-lg text-xs font-pixel tracking-wider transition-all duration-300 cursor-pointer"
                title="重新调制"
              >
                <RefreshCw size={13} />
                <span>重置</span>
              </button>
              <button 
                className="p-2 rounded-lg hover:bg-white text-white hover:text-black border border-white/10 transition-all duration-300"
                title="收藏配方"
              >
                <Bookmark size={15} />
              </button>
              <button 
                className="p-2 rounded-lg hover:bg-white text-white hover:text-black border border-white/10 transition-all duration-300"
                title="分享配方"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>
      </div>

      {/* RIGHT: Visualizer */}
      <div className="flex-1 lg:w-[60%] bg-gradient-to-b from-[#080808] to-[#020202] flex items-center justify-center p-0 relative overflow-hidden group">
         
         {/* Top-Right Floating Controls (Always in view) */}
         <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
             {onTune && (
                 <button 
                    onClick={onTune}
                    className="flex items-center gap-2 px-4 py-2.5 bg-black/80 hover:bg-cyan-400 backdrop-blur-xl border border-cyan-400/60 hover:border-cyan-300 text-cyan-300 hover:text-black rounded-full text-xs font-pixel tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer hover:scale-105 active:scale-95"
                >
                    <Sliders size={14} className="animate-pulse" />
                    <span>[ 调整配方 TUNE ]</span>
                </button>
             )}
             <button 
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-black/80 hover:bg-white backdrop-blur-xl border border-white/20 hover:border-white text-white hover:text-black rounded-full text-xs font-pixel tracking-wider transition-all duration-300 shadow-lg cursor-pointer"
            >
                <RefreshCw size={14} />
                <span>RESET</span>
            </button>
         </div>

         {/* Dynamic Background Spotlights */}
         <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-[5000ms]"></div>
         <div 
            className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none mix-blend-screen opacity-30"
            style={{ backgroundColor: recipe.colorHex }}
         ></div>

         {/* Visualizer Container - Interactive */}
         <div className="w-full h-full flex items-center justify-center relative">
            <CocktailVisualizer recipe={recipe} />
         </div>

         {/* Bottom Floating Bar */}
         <div className="absolute bottom-6 right-6 z-50 flex items-center gap-3">
             {onTune && (
                 <button 
                    onClick={onTune}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-cyan-500/20 hover:from-cyan-400 hover:to-blue-400 backdrop-blur-xl border border-cyan-400/60 hover:border-cyan-300 text-cyan-300 hover:text-black rounded-full text-xs font-pixel tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer hover:scale-105 active:scale-95"
                >
                    <Sliders size={14} />
                    <span>[ 调整配方 TUNE ]</span>
                </button>
             )}
             <button 
                onClick={onReset}
                className="flex items-center gap-2 px-5 py-2.5 bg-black/70 hover:bg-white backdrop-blur-xl border border-white/10 hover:border-white text-white hover:text-black rounded-full text-xs font-pixel tracking-wider transition-all duration-300 shadow-xl cursor-pointer"
            >
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
                <span>REGENERATE</span>
            </button>
         </div>
      </div>

    </motion.div>
  );
};
