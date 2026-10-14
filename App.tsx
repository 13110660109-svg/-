import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeMood } from './services/geminiService';
import { MoodRecipe, AppState, TarotCard } from './types';
import { LiquidVisualizer } from './components/LiquidVisualizer';
import { RecipeCard } from './components/RecipeCard';
import { AudioVisualizer } from './components/AudioVisualizer';
import { TypingParticles, TypingParticlesRef } from './components/TypingParticles';
import { DigitalGarden } from './components/DigitalGarden';
import { HandParticleSystem } from './components/HandParticleSystem';
import { GestureController } from './components/GestureController';
import { InteractiveBackground } from './components/InteractiveBackground';
import { FloatingHistory } from './components/FloatingHistory';
import { TarotDeck } from './components/TarotDeck';
import { audioEngine } from './services/audioEngine';
import { Sparkles, Mic, ArrowRight, Volume2, VolumeX, Sliders, Palette, Clover, Star, Hand, Flower, ChevronRight } from 'lucide-react';

// Poetic Chinese Question Bank
const POETIC_QUESTIONS = [
    // Layer 1: Nature & Environment (山川草木)
    "若此刻窗外开始下雨，你希望那是什么样的雨？",
    "闭上眼，你觉得自己现在身处深林，还是荒原？",
    "如果现在的空气有一种味道，是干燥的木头，还是潮湿的苔藓？",
    "抬头看，你心里的天空现在是什么颜色？",
    "你感觉自己像是一株什么植物？",
    "如果时间是一条河，你觉得它现在流得急吗？",
    
    // Layer 2: Inner Self (本心)
    "心里那块最柔软的地方，现在放着什么？",
    "有没有一个念头，像微尘一样在光里漂浮？",
    "此刻的沉默里，藏着什么没说出口的话？",
    "你感觉身体里是空的，还是满的？",
    "如果给现在的心情起个名字，它会叫什么？",
    "你是在等待什么，还是在怀念什么？",

    // Layer 3: Memory & Abstract (时光)
    "今天发生的哪件小事，像一根刺或一朵花？",
    "如果能给昨晚的梦续写一个结局，会是什么？",
    "你想起了谁？那个名字是暖的还是冷的？",
    "最近一次让你感觉到“真实”的瞬间是何时？",
    "如果把今天折叠成一张纸，你会把它夹在哪本书里？",
    
    // Layer 4: Sensory (五感)
    "此刻，你渴望一种什么样的温度？",
    "如果情绪有声音，是玻璃破碎，还是琴弦微颤？",
    "你觉得现在的自己，是易碎的还是坚硬的？",
    "如果能喝下一口月光，你觉得它是什么味道？",
    "你的呼吸现在是沉重的，还是轻盈的？",

    // Layer 5: Future & Hope (愿景)
    "明天太阳升起时，你希望把什么留在黑夜里？",
    "喝完这杯酒，你想去哪里流浪？",
    "如果可以，你想对五分钟前的自己说什么？",
    "你希望这杯酒是安抚，还是唤醒？",
    "在这个瞬间，你最想抓住的是什么？"
];

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [input, setInput] = useState('');
  const [recipe, setRecipe] = useState<MoodRecipe | null>(null);
  const [currentGradient, setCurrentGradient] = useState({ start: '#ef4444', end: '#06b6d4' }); // Red Strings Default
  const [isMuted, setIsMuted] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [showHandParticles, setShowHandParticles] = useState(false);
  const [isGestureMode, setIsGestureMode] = useState(false);
  const [handOpenness, setHandOpenness] = useState(1);
  
  // Interview State
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionQueue, setQuestionQueue] = useState<string[]>([]);
  const [questionStage, setQuestionStage] = useState(0); 
  const [conversationHistory, setConversationHistory] = useState<{question: string, answer: string}[]>([]);
  
  // Tarot State
  const [tarotCard, setTarotCard] = useState<TarotCard | undefined>(undefined);

  // Customization
  const [luckLevel, setLuckLevel] = useState(50);
  const [tastePref, setTastePref] = useState('平衡 Balanced');
  const [luckyColor, setLuckyColor] = useState('');
  const [customHue, setCustomHue] = useState(0); 
  const [zodiac, setZodiac] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const particlesRef = useRef<TypingParticlesRef>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input, currentQuestion]);

  const toggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
    audioEngine.playSFX('click');
  };

  const generateQuestionQueue = () => {
      const shuffled = [...POETIC_QUESTIONS];
      for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, 5); 
  };

  const handleStart = () => {
    setAppState(AppState.INPUT);
    setConversationHistory([]);
    setQuestionStage(0);
    setTarotCard(undefined); // Reset tarot
    
    const queue = generateQuestionQueue();
    setQuestionQueue(queue);
    setCurrentQuestion(queue[0]);
    
    audioEngine.init(); 
    audioEngine.playSFX('glass_clink');
    audioEngine.startAmbient();
  };

  const toggleMic = () => {
    audioEngine.playSFX('click');
    setIsMicActive(!isMicActive);
    if (isGestureMode && !isMicActive) setIsGestureMode(false);
  };

  const toggleGestureMode = () => {
      audioEngine.playSFX('click');
      setIsGestureMode(!isGestureMode);
      if (!isGestureMode) {
          setHandOpenness(0.5); 
      } else {
          setHandOpenness(1);
      }
  };

  const detectMoodGradient = (text: string): { start: string, end: string } => {
      const lower = text.toLowerCase();
      if (lower.match(/(怒|火|热|恨|烦|burn|fire)/)) return { start: '#ef4444', end: '#facc15' }; 
      if (lower.match(/(悲|泪|冷|雨|深|海|blue|sad)/)) return { start: '#3b82f6', end: '#06b6d4' }; 
      if (lower.match(/(喜|笑|光|乐|暖|sun|joy)/)) return { start: '#eab308', end: '#ec4899' }; 
      if (lower.match(/(爱|甜|粉|柔|heart|pink)/)) return { start: '#ec4899', end: '#a855f7' }; 
      if (lower.match(/(绿|草|树|森|静|nature|calm)/)) return { start: '#10b981', end: '#14b8a6' }; 
      if (lower.match(/(梦|幻|星|紫|空|dream|void)/)) return { start: '#8b5cf6', end: '#6366f1' }; 
      if (lower.match(/(累|困|黑|夜|孤|dark|night)/)) return { start: '#475569', end: '#0f172a' }; 
      return { start: '#ef4444', end: '#06b6d4' }; 
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value;
      setInput(newVal);
      const detected = detectMoodGradient(newVal);
      if (luckyColor) {
         setCurrentGradient({ start: luckyColor, end: detected.end });
      } else {
         setCurrentGradient(detected);
      }
      if (newVal.length > input.length) {
          audioEngine.playSFX('type_bubble');
          if (particlesRef.current) {
              particlesRef.current.spawn();
          }
      }
  };

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const hue = parseInt(e.target.value);
      setCustomHue(hue);
      const hex = hslToHex(hue, 80, 60); 
      setLuckyColor(hex);
      setCurrentGradient({ start: hex, end: currentGradient.end });
  };

  const handleNextStep = async () => {
    if (!input.trim()) return;
    
    // Save current interaction
    const newHistory = [...conversationHistory, { question: currentQuestion, answer: input }];
    setConversationHistory(newHistory);
    setInput('');
    audioEngine.playSFX('success');

    if (questionStage < 4) {
        const nextStage = questionStage + 1;
        setQuestionStage(nextStage);
        setCurrentQuestion(questionQueue[nextStage]);
    } else {
        // Switch to Tarot Phase
        setAppState(AppState.TAROT);
    }
  };

  const handleTarotSelect = (card: TarotCard) => {
      setTarotCard(card);
      // Proceed to the dedicated Mixology Tuning (调节界面)
      setAppState(AppState.TUNE);
      audioEngine.playSFX('glass_clink');
  };

  const handleStartMixing = () => {
      if (!tarotCard) return;
      handleMix(conversationHistory, tarotCard);
  };

  const handleMix = async (history: {question: string, answer: string}[], card: TarotCard) => {
    setAppState(AppState.ANALYZING);
    setIsMicActive(false); 
    setIsGestureMode(false);
    setShowSettings(false);

    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const currentDay = days[new Date().getDay()];

    try {
      const result = await analyzeMood(history, {
        taste: tastePref,
        luck: luckLevel,
        luckyColor: luckyColor || undefined,
        zodiac: zodiac || '未知 Unknown',
        day: currentDay,
        tarot: card
      });
      setRecipe(result);
      
      setTimeout(() => {
        audioEngine.playSFX('glass_clink');
        setCurrentGradient({ start: result.colorHex, end: currentGradient.end });
        setAppState(AppState.RESULT);
      }, 800);
    } catch (e) {
      console.error(e);
      setAppState(AppState.TUNE);
    }
  };

  const resetApp = () => {
    audioEngine.playSFX('click');
    setAppState(AppState.IDLE);
    setInput('');
    setRecipe(null);
    setCurrentGradient({ start: '#ef4444', end: '#06b6d4' }); // Red/Cyan reset
    setLuckLevel(50);
    setLuckyColor('');
    setZodiac('');
    setTastePref('平衡 Balanced');
    setConversationHistory([]);
    setQuestionStage(0);
    setQuestionQueue([]);
    setTarotCard(undefined);
  };

  const zodiacOptions = [
    { sign: "白羊 Aries", symbol: "♈", date: "3.21-4.19" },
    { sign: "金牛 Taurus", symbol: "♉", date: "4.20-5.20" },
    { sign: "双子 Gemini", symbol: "♊", date: "5.21-6.21" },
    { sign: "巨蟹 Cancer", symbol: "♋", date: "6.22-7.22" },
    { sign: "狮子 Leo", symbol: "♌", date: "7.23-8.22" },
    { sign: "处女 Virgo", symbol: "♍", date: "8.23-9.22" },
    { sign: "天秤 Libra", symbol: "♎", date: "9.23-10.23" },
    { sign: "天蝎 Scorpio", symbol: "♏", date: "10.24-11.22" },
    { sign: "射手 Sagittarius", symbol: "♐", date: "11.23-12.21" },
    { sign: "摩羯 Capricorn", symbol: "♑", date: "12.22-1.19" },
    { sign: "水瓶 Aquarius", symbol: "♒", date: "1.20-2.18" },
    { sign: "双鱼 Pisces", symbol: "♓", date: "2.19-3.20" }
  ];

  return (
    <div className="crt-wrapper">
      <div className="crt-monitor">
        {/* CRT Overlay Effects */}
        <div className="crt-curvature"></div>
        <div className="scanlines"></div>
        <div className="crt-flicker"></div>
        
        {/* Main App Content - Scaled slightly to fit monitor bezel if needed */}
        <div className="crt-screen relative w-full h-full overflow-hidden bg-[#050505] selection:bg-red-500/30 selection:text-red-100 flex flex-col">
            <InteractiveBackground />
            <TypingParticles ref={particlesRef} />
            
            <FloatingHistory 
                history={conversationHistory} 
                onHoverTrigger={(x, y) => particlesRef.current?.spawnAt(x, y)}
            />

            <AnimatePresence>
                {showHandParticles && <HandParticleSystem onClose={() => setShowHandParticles(false)} />}
            </AnimatePresence>
            
            <GestureController 
                isActive={isGestureMode} 
                onOpennessChange={(val) => {
                    setHandOpenness(prev => prev + (val - prev) * 0.1);
                }} 
            />

            {/* Header */}
            <header className="relative z-50 w-full p-4 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-sm">
                <div className="flex flex-col">
                    <div className="text-xl md:text-2xl font-pixel tracking-widest text-white/90 chromatic-text">
                    明天会是什么颜色?
                    </div>
                    <div className="text-[10px] text-red-500 font-mono tracking-[0.3em]">
                    NEURAL_LINK_ESTABLISHED
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowHandParticles(true)} 
                        className="flex items-center gap-2 px-3 py-1 border border-white/10 hover:border-cyan-400 text-xs font-pixel text-white/60 hover:text-cyan-400 hover:bg-cyan-900/20 transition-all uppercase tracking-wider"
                    >
                        <Hand size={14} /> [3D_SPACE]
                    </button>
                    <button onClick={toggleMute} className="text-white/40 hover:text-red-500 transition-colors">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <div className="text-xs font-pixel text-cyan-500 border border-cyan-500/20 bg-cyan-900/10 px-2 py-1 tracking-widest">
                    V.2.5.0
                    </div>
                </div>
            </header>

            <main className="flex-grow relative z-10 flex flex-col items-center justify-center p-4 overflow-y-auto no-scrollbar">
                
                {/* Background Audio Visualizer (Active only during voice input) */}
                {isMicActive && appState === 'INPUT' && (
                    <div className="absolute inset-0 pointer-events-none z-0">
                        <AudioVisualizer isActive={true} />
                    </div>
                )}

                <div className="w-full max-w-5xl mx-auto text-center relative min-h-[400px]">
                    <AnimatePresence>
                        
                        {appState === 'IDLE' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex flex-col items-center mt-12"
                        >
                            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight text-white chromatic-text">
                            明天会是<br/><span className="text-red-500">什么</span><span className="text-cyan-400">颜色</span>?
                            </h1>
                            <p className="font-pixel text-white/40 tracking-[0.2em] mb-12 text-sm blink">
                                /// PRESS_START_TO_BEGIN ///
                            </p>
                            
                            <button 
                            onClick={handleStart}
                            className="group relative px-12 py-4 bg-transparent hover:bg-white/5 text-white border border-white/20 hover:border-red-500 hover:text-red-500 font-pixel text-xl tracking-[0.2em] transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                            >
                            <span className="relative z-10 flex items-center gap-3">
                                [ START_SESSION ] <ArrowRight size={18} />
                            </span>
                            </button>
                        </motion.div>
                        )}

                        {appState === 'INPUT' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full mt-4"
                        >
                            <div className="flex justify-center items-center gap-1 mb-12">
                                <span className="text-[10px] font-pixel text-white/40 mr-2">PROGRESS:</span>
                                {[0,1,2,3,4].map(i => (
                                    <div 
                                        key={i} 
                                        className={`h-2 w-8 transition-all duration-300 border border-white/10 ${i <= questionStage ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-transparent'}`}
                                    />
                                ))}
                            </div>

                            <motion.div 
                                key={currentQuestion}
                                initial={{ opacity: 0, filter: 'blur(5px)' }}
                                animate={{ opacity: 1, filter: 'blur(0px)' }}
                                transition={{ duration: 0.8 }}
                                className="mb-8"
                            >
                                <p className="text-xs font-pixel text-cyan-400 mb-2 tracking-widest">&gt;&gt; SYSTEM_QUERY_0{questionStage+1}</p>
                                <h3 className="text-white/90 text-2xl md:text-3xl font-serif leading-relaxed drop-shadow-md">
                                    {currentQuestion}
                                </h3>
                            </motion.div>

                            <div className="relative group mb-10 max-w-2xl mx-auto">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={handleInput}
                                    placeholder="请输入你的回应..."
                                    className="w-full bg-black/60 backdrop-blur-md border border-white/10 group-hover:border-white/30 focus:border-cyan-500 rounded-none text-xl font-serif text-center text-white placeholder-white/20 focus:outline-none transition-all resize-none overflow-hidden py-8 min-h-[120px] relative z-10 shadow-inner"
                                    rows={1}
                                    autoFocus
                                />
                                {/* Cyberpunk Brackets */}
                                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-white/20 group-hover:border-cyan-500 transition-colors pointer-events-none"></div>
                                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-white/20 group-hover:border-cyan-500 transition-colors pointer-events-none"></div>
                                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-white/20 group-hover:border-cyan-500 transition-colors pointer-events-none"></div>
                                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-white/20 group-hover:border-cyan-500 transition-colors pointer-events-none"></div>
                            </div>

                            <div className="flex justify-center gap-4 mb-8">
                                <button 
                                    onClick={() => {
                                        setShowSettings(!showSettings);
                                        audioEngine.playSFX('click');
                                    }}
                                    className="flex items-center gap-2 px-4 py-1.5 border border-white/10 hover:border-cyan-400 hover:text-cyan-400 bg-black/40 transition-all text-xs font-pixel text-white/50 uppercase tracking-wider"
                                >
                                    <Sliders size={12} />
                                    <span>{showSettings ? "CLOSE_CONFIG" : "CONFIG_PARAMETERS"}</span>
                                </button>
                            </div>

                            <AnimatePresence>
                                {showSettings && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mb-8 bg-black/80 backdrop-blur-xl border-y border-white/10 relative z-20"
                                    >
                                        <div className="p-6 grid gap-8 text-left max-w-5xl mx-auto">
                                            {/* Zodiac Section - Frosted Cards */}
                                            <div>
                                                <label className="flex items-center gap-2 text-sm uppercase tracking-widest text-cyan-500 mb-4 font-pixel">
                                                    <Star size={14} /> 星盘数据 ZODIAC_DATA
                                                </label>
                                                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                                                    {zodiacOptions.map((z) => {
                                                        const isSelected = zodiac === z.sign;
                                                        return (
                                                            <button
                                                                key={z.sign}
                                                                onClick={() => {
                                                                    setZodiac(z.sign);
                                                                    audioEngine.playSFX('click');
                                                                }}
                                                                className={`
                                                                    relative group flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-300 overflow-hidden
                                                                    ${isSelected 
                                                                        ? 'border-cyan-400 bg-cyan-900/30 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                                                                        : 'border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30'
                                                                    }
                                                                `}
                                                            >
                                                                <span 
                                                                    className={`text-2xl mb-1 transition-all font-serif bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 ${isSelected ? 'from-cyan-300 to-purple-300 scale-110' : ''}`}
                                                                >
                                                                    {z.symbol}
                                                                </span>
                                                                <span className={`text-[9px] font-pixel tracking-wider ${isSelected ? 'text-white' : 'text-white/30'}`}>
                                                                    {z.sign.split(' ')[1]}
                                                                </span>
                                                                <span className="text-[8px] font-pixel text-white/20 mt-1">{z.date}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-8">
                                                {/* Luck */}
                                                <div>
                                                    <label className="flex items-center gap-2 text-sm uppercase tracking-widest text-red-500 mb-3 font-pixel">
                                                        <Clover size={14} /> 运势校准 LUCK_CALIBRATION
                                                    </label>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-pixel text-red-400 w-8">{luckLevel}%</span>
                                                        <input 
                                                            type="range" 
                                                            min="0" max="100" 
                                                            value={luckLevel}
                                                            onChange={(e) => setLuckLevel(parseInt(e.target.value))}
                                                            className="w-full h-2 bg-white/10 appearance-none cursor-pointer border border-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {/* Taste */}
                                                <div>
                                                    <label className="text-sm uppercase tracking-widest text-amber-500 mb-3 block font-pixel">
                                                        口味偏好 TASTE_PROFILE
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['酸甜 Sour', '苦涩 Bitter', '辛辣 Spicy', '清爽 Fresh', '浓郁 Rich'].map(t => (
                                                            <button
                                                                key={t}
                                                                onClick={() => {
                                                                    setTastePref(t);
                                                                    audioEngine.playSFX('click');
                                                                }}
                                                                className={`text-[10px] font-pixel tracking-wider px-3 py-1.5 border transition-all ${tastePref === t ? 'bg-amber-500 text-black border-amber-500 font-bold' : 'border-white/10 bg-black text-white/50 hover:border-white/40'}`}
                                                            >
                                                                {t.split(' ')[0]}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-center gap-4 items-center">
                                <button 
                                    onClick={toggleGestureMode}
                                    className={`p-3 border transition-all duration-300 relative group ${isGestureMode ? 'border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-white/10 text-white/30 hover:text-white hover:border-white/30'}`}
                                    title="生物手势模式"
                                >
                                    <Flower size={20} />
                                </button>

                                <button 
                                    onClick={toggleMic}
                                    className={`p-3 border transition-all duration-300 relative group ${isMicActive ? 'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10 text-white/30 hover:text-white hover:border-white/30'}`}
                                >
                                    <Mic size={20} />
                                </button>
                                
                                <button 
                                    onClick={handleNextStep}
                                    disabled={!input.trim()}
                                    className="flex items-center gap-3 px-10 py-3 bg-white text-black font-pixel text-lg tracking-widest hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/20"
                                >
                                    <span>{questionStage < 4 ? "NEXT_PHASE" : "DRAW_FATE"}</span>
                                    {questionStage < 4 ? <ChevronRight size={18} /> : <Sparkles size={18} />}
                                </button>
                            </div>
                        </motion.div>
                        )}

                        {appState === 'TAROT' && (
                            <motion.div
                                key="tarot"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full flex items-center justify-center"
                            >
                                <TarotDeck onCardSelect={handleTarotSelect} />
                            </motion.div>
                        )}

                        {appState === 'ANALYZING' && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-12 flex flex-col items-center gap-6"
                        >
                            {/* Cyberpunk Loader */}
                            <div className="flex gap-1 items-end h-8 mb-4">
                            {[1,2,3,4,5].map((i) => (
                                <motion.div 
                                    key={i}
                                    className="w-2 bg-red-500"
                                    animate={{ 
                                        height: [10, 40, 10],
                                        opacity: [0.3, 1, 0.3],
                                        backgroundColor: ["#ef4444", "#06b6d4", "#ef4444"]
                                    }}
                                    transition={{ 
                                        repeat: Infinity, 
                                        duration: 0.8, 
                                        delay: i * 0.1,
                                        ease: "linear"
                                    }}
                                />
                            ))}
                            </div>

                            <div className="space-y-4 text-center">
                                <motion.p 
                                    key="step1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xl font-pixel tracking-[0.2em] text-cyan-400"
                                >
                                    INTERPRETING_ARCANA...
                                </motion.p>
                            </div>
                        </motion.div>
                        )}

                        {appState === 'TUNE' && (
                            <motion.div
                                key="tune"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                                className="w-full max-w-4xl mx-auto my-2 text-left bg-black/85 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative z-30"
                            >
                                {/* Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 mb-5 border-b border-white/10 gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 text-cyan-400 font-pixel text-xs tracking-widest uppercase mb-1">
                                            <Sliders size={14} />
                                            <span>&gt;&gt; EMOTION_MIXOLOGY_STATION // 情绪调配控制台</span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-serif text-white font-medium">
                                            专属特调配方校准
                                        </h2>
                                    </div>
                                    
                                    {tarotCard && (
                                        <div className="flex items-center gap-3 px-4 py-2.5 bg-red-950/40 border border-red-500/40 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                            <Sparkles size={16} className="text-red-400 animate-pulse" />
                                            <div>
                                                <div className="text-[9px] font-pixel text-red-300 uppercase tracking-widest">TAROT_BLESSING</div>
                                                <div className="text-sm font-serif text-white">【{tarotCard.nameCN}】· {tarotCard.meaning}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Extracted Mood tags from questions */}
                                {conversationHistory.length > 0 && (
                                    <div className="mb-6 bg-white/[0.03] border border-white/5 p-4 rounded-xl">
                                        <span className="text-[10px] font-pixel text-white/40 uppercase tracking-wider block mb-2">
                                            已沉淀的心绪原液 (EXTRACTED_EMOTIONAL_ESSENCE):
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {conversationHistory.map((item, idx) => (
                                                <span 
                                                    key={idx} 
                                                    className="text-xs font-serif px-3 py-1 bg-white/5 border border-white/10 text-white/80 rounded-full"
                                                >
                                                    "{item.answer.length > 15 ? item.answer.slice(0, 15) + '...' : item.answer}"
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tuning Grid */}
                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    {/* Luck Calibration */}
                                    <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center">
                                            <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-red-400 font-pixel">
                                                <Clover size={14} /> 运势校准 LUCK_CALIBRATION
                                            </label>
                                            <span className="font-pixel text-base text-red-400 font-bold">{luckLevel}%</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" max="100" 
                                            value={luckLevel}
                                            onChange={(e) => setLuckLevel(parseInt(e.target.value))}
                                            className="w-full h-2 bg-white/10 appearance-none cursor-pointer border border-white/10 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                                        />
                                        <div className="flex justify-between text-[10px] font-pixel text-white/40">
                                            <span>沉潜蓄力</span>
                                            <span>顺其自然</span>
                                            <span>鸿运当头</span>
                                        </div>
                                    </div>

                                    {/* Taste Profile */}
                                    <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                        <label className="text-xs uppercase tracking-widest text-amber-400 block font-pixel">
                                            口味偏好 TASTE_PROFILE
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {['酸甜 Sour', '苦涩 Bitter', '辛辣 Spicy', '清爽 Fresh', '浓郁 Rich', '平衡 Balanced'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => {
                                                        setTastePref(t);
                                                        audioEngine.playSFX('click');
                                                    }}
                                                    className={`text-xs font-pixel tracking-wider px-3 py-1.5 border rounded-lg transition-all ${
                                                        tastePref === t 
                                                            ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                                                            : 'border-white/10 bg-black/60 text-white/60 hover:border-white/30 hover:text-white'
                                                    }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color Hue Spectrum */}
                                    <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center">
                                            <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-pink-400 font-pixel">
                                                <Palette size={14} /> 情绪色调与光泽 COLOR_SPECTRUM
                                            </label>
                                            <span 
                                                className="inline-block w-4 h-4 rounded-full border border-white/40 shadow-sm"
                                                style={{ backgroundColor: currentGradient.start }}
                                            />
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" max="360" 
                                            value={customHue}
                                            onChange={handleColorChange}
                                            className="w-full h-3 rounded-full appearance-none cursor-pointer border border-white/10"
                                            style={{
                                                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                                            }}
                                        />
                                        <div className="flex justify-between text-[10px] font-pixel text-white/40">
                                            <span>烈焰赤红</span>
                                            <span>青翠灵动</span>
                                            <span>深邃海蓝</span>
                                            <span>梦幻霓紫</span>
                                        </div>
                                    </div>

                                    {/* Zodiac */}
                                    <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400 font-pixel">
                                            <Star size={14} /> 星盘印记 ZODIAC_ALIGNMENT
                                        </label>
                                        <div className="grid grid-cols-6 gap-1.5">
                                            {zodiacOptions.map((z) => {
                                                const isSelected = zodiac === z.sign;
                                                return (
                                                    <button
                                                        key={z.sign}
                                                        onClick={() => {
                                                            setZodiac(z.sign);
                                                            audioEngine.playSFX('click');
                                                        }}
                                                        className={`flex flex-col items-center justify-center py-1.5 px-0.5 border rounded-lg transition-all text-center ${
                                                            isSelected 
                                                                ? 'border-cyan-400 bg-cyan-900/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105' 
                                                                : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                    >
                                                        <span className="text-sm leading-none mb-0.5">{z.symbol}</span>
                                                        <span className="text-[8px] font-pixel">{z.sign.split(' ')[0]}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <button
                                        onClick={() => {
                                            setAppState(AppState.TAROT);
                                            audioEngine.playSFX('click');
                                        }}
                                        className="text-xs font-pixel text-white/40 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1.5"
                                    >
                                        <span>&lt; 重抽塔罗牌 RE-DRAW</span>
                                    </button>

                                    <button
                                        onClick={handleStartMixing}
                                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-red-500 via-purple-600 to-cyan-500 hover:from-red-400 hover:to-cyan-400 text-white font-pixel text-lg font-bold tracking-[0.25em] shadow-[0_0_35px_rgba(239,68,68,0.5)] transition-all cursor-pointer rounded-xl hover:scale-105 active:scale-95"
                                    >
                                        <Sparkles size={20} />
                                        <span>[ 启动摇壶调制 · 萃取专属特调 START_MIXING ]</span>
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {appState === 'RESULT' && recipe && (
                        <RecipeCard 
                            recipe={recipe} 
                            onReset={resetApp} 
                            onTune={() => {
                                setAppState(AppState.TUNE);
                                audioEngine.playSFX('click');
                            }}
                        />
                        )}

                    </AnimatePresence>
                </div>

                <DigitalGarden 
                    count={conversationHistory.length * 10 + input.length} 
                    color={currentGradient.start} 
                    growthScale={isGestureMode ? handOpenness : 1} 
                />

                <footer className="relative z-10 p-6 text-center text-white/20 text-[10px] font-pixel tracking-[0.3em] uppercase mt-auto">
                    <p>System Powered by Gemini AI • Version 3.0 (Balatro_Mod)</p>
                </footer>
            </main>
        </div>
      </div>
    </div>
  );
}
