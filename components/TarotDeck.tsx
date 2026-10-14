import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from '../types';
import { Sparkles, Moon, Sun, Star, Anchor, Eye, Heart, Zap, Crown, Key, ArrowRight } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface TarotDeckProps {
    onCardSelect: (card: TarotCard) => void;
}

const MAJOR_ARCANA: TarotCard[] = [
    { id: 0, name: "The Fool", nameCN: "愚者", symbol: "Star", meaning: "新的开始，自由，冒险" },
    { id: 1, name: "The Magician", nameCN: "魔术师", symbol: "Zap", meaning: "创造力，意志，显化" },
    { id: 2, name: "The High Priestess", nameCN: "女祭司", symbol: "Moon", meaning: "直觉，潜意识，神秘" },
    { id: 3, name: "The Empress", nameCN: "皇后", symbol: "Heart", meaning: "丰饶，自然，感性" },
    { id: 4, name: "The Emperor", nameCN: "皇帝", symbol: "Crown", meaning: "权威，结构，稳定" },
    { id: 9, name: "The Hermit", nameCN: "隐士", symbol: "Eye", meaning: "内省，探索，孤独" },
    { id: 10, name: "Wheel of Fortune", nameCN: "命运之轮", symbol: "Anchor", meaning: "转折，宿命，循环" },
    { id: 19, name: "The Sun", nameCN: "太阳", symbol: "Sun", meaning: "成功，喜悦，活力" },
    { id: 21, name: "The World", nameCN: "世界", symbol: "Key", meaning: "圆满，达成，整合" }
];

export const TarotDeck: React.FC<TarotDeckProps> = ({ onCardSelect }) => {
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
    const [resultCard, setResultCard] = useState<TarotCard | null>(null);
    const [isShuffling, setIsShuffling] = useState(true);
    const [countdown, setCountdown] = useState<number | null>(null);
    const timerRef = React.useRef<any>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsShuffling(false);
        }, 500);
        return () => {
            clearTimeout(timer);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const proceedWithCard = (card: TarotCard) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        audioEngine.playSFX('glass_clink');
        onCardSelect(card);
    };

    const handleCardClick = (index: number) => {
        if (selectedCardId !== null) return;
        setIsShuffling(false);

        audioEngine.playSFX('click');
        setSelectedCardId(index);

        // Logic: Pick a random card
        const randomTarot = MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)];
        setResultCard(randomTarot);

        audioEngine.playSFX('success');
        setCountdown(2);
        
        // Auto proceed after 2.2s or user can click button immediately
        timerRef.current = setTimeout(() => {
            proceedWithCard(randomTarot);
        }, 2200);
    };

    const getIcon = (name: string) => {
        switch(name) {
            case 'Star': return <Star size={60} strokeWidth={1.5} />;
            case 'Zap': return <Zap size={60} strokeWidth={1.5} />;
            case 'Moon': return <Moon size={60} strokeWidth={1.5} />;
            case 'Heart': return <Heart size={60} strokeWidth={1.5} />;
            case 'Crown': return <Crown size={60} strokeWidth={1.5} />;
            case 'Eye': return <Eye size={60} strokeWidth={1.5} />;
            case 'Anchor': return <Anchor size={60} strokeWidth={1.5} />;
            case 'Sun': return <Sun size={60} strokeWidth={1.5} />;
            case 'Key': return <Key size={60} strokeWidth={1.5} />;
            default: return <Sparkles size={60} strokeWidth={1.5} />;
        }
    };

    // Render logic helper
    const renderCard = (index: number, isSelected: boolean) => (
        <motion.div
            className={`relative cursor-pointer preserve-3d group ${isSelected ? 'w-64 h-96 z-50' : 'w-48 h-80'}`}
            onClick={() => handleCardClick(index)}
            animate={isShuffling ? {
                opacity: 1,
                y: [0, -10, 0],
                rotate: [0, (Math.random()-0.5)*4, 0],
            } : {
                opacity: 1,
                y: 0,
                rotateY: isSelected ? 180 : 0, // Flip only if selected
                scale: isSelected ? 1 : 1, // Layout handles scale
            }}
            transition={isShuffling 
                ? { duration: 0.25, ease: "easeInOut", type: "tween" } 
                : { duration: 0.45, type: "spring", stiffness: 90 }
            }
        >
            {/* Card Back */}
            <div 
                className="absolute inset-0 bg-[#1a1a1a] border-2 border-red-900/50 rounded-xl flex items-center justify-center backface-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] overflow-hidden"
                style={{ backfaceVisibility: 'hidden' }}
            >
                <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
                <div className="absolute inset-3 border border-red-500/20 rounded flex items-center justify-center">
                    <div className="w-24 h-24 border-2 border-red-500 rotate-45 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <div className="w-16 h-16 border border-red-500 rotate-45 bg-red-900/20"></div>
                    </div>
                </div>
            </div>

            {/* Card Front (Result) */}
            <div 
                className="absolute inset-0 bg-[#e5e5e5] rounded-xl flex flex-col items-center p-6 backface-hidden shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
            >
                {resultCard && (
                    <>
                        <div className="w-full border-b-2 border-black pb-3 mb-6 flex justify-between items-center px-1">
                            <span className="font-pixel text-2xl text-black">{resultCard.id === 0 ? '0' : resultCard.id}</span>
                            <span className="font-serif font-bold text-black uppercase tracking-widest text-[10px]">MAJOR ARCANA</span>
                        </div>
                        
                        <div className="flex-grow flex items-center justify-center text-black mb-6 animate-pulse">
                            {getIcon(resultCard.symbol)}
                        </div>

                        <div className="text-center w-full">
                            <h3 className="font-serif text-3xl font-bold text-black mb-1">{resultCard.name}</h3>
                            <p className="font-serif text-xl text-red-700 mb-3 font-semibold">{resultCard.nameCN}</p>
                            <div className="w-full h-[1px] bg-black/20 mb-2"></div>
                            <p className="font-pixel text-xs text-black/60 uppercase tracking-widest">{resultCard.meaning}</p>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="flex flex-col items-center justify-center w-full h-full relative z-30">
            <motion.h2 
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-pixel text-cyan-400 mb-12 tracking-[0.3em] chromatic-text"
            >
                {isShuffling ? "SHUFFLING_FATE..." : (resultCard ? "DESTINY_REVEALED" : "DRAW_YOUR_CARD")}
            </motion.h2>

            <div className="relative w-full h-[450px] flex items-center justify-center perspective-[1000px]">
                <AnimatePresence>
                    {selectedCardId === null ? (
                        // Deck State: Show 3 Cards
                        <motion.div 
                            className="flex gap-8"
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
                        >
                            {[0, 1, 2].map(i => (
                                <div key={i}>{renderCard(i, false)}</div>
                            ))}
                        </motion.div>
                    ) : (
                        // Reveal State: Show 1 Selected Card Centered
                        <motion.div
                            key="reveal-container"
                            className="flex flex-col items-center justify-center"
                        >
                            {renderCard(selectedCardId, true)}
                            
                            {/* Card Meaning Text Below */}
                            {resultCard && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                    className="mt-6 text-center bg-black/80 backdrop-blur-md border border-white/10 p-5 rounded-2xl max-w-lg shadow-[0_0_40px_rgba(0,0,0,0.8)]"
                                >
                                    <p className="text-xs font-pixel text-cyan-400 uppercase tracking-widest mb-1.5">&gt;&gt; FATE_REVEALED</p>
                                    <p className="text-base md:text-lg font-serif text-white/90 italic mb-4">
                                        "你抽到了 <span className="text-red-400 font-bold">{resultCard.nameCN}</span> · 寓意：{resultCard.meaning}"
                                    </p>
                                    
                                    <button 
                                        onClick={() => proceedWithCard(resultCard)}
                                        className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-red-500 via-purple-600 to-cyan-500 hover:from-red-400 hover:to-cyan-400 text-white font-pixel text-base font-bold tracking-[0.2em] shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all cursor-pointer rounded-lg hover:scale-105"
                                    >
                                        <span>[ 进入情绪调剂台 ENTER_MIXOLOGY_CONSOLE ]</span>
                                        <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};