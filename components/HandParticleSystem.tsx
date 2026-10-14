
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Palette, Box, Heart, Circle, Activity, Camera } from 'lucide-react';

// Shapes Generator
type ShapeType = 'sphere' | 'cube' | 'heart' | 'helix';

const generateShape = (type: ShapeType, count: number): Float32Array => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        let x = 0, y = 0, z = 0;
        const idx = i * 3;

        if (type === 'sphere') {
            const r = 40;
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            x = r * Math.cos(theta) * Math.sin(phi);
            y = r * Math.sin(theta) * Math.sin(phi);
            z = r * Math.cos(phi);
        } 
        else if (type === 'cube') {
            const size = 60;
            x = (Math.random() - 0.5) * size;
            y = (Math.random() - 0.5) * size;
            z = (Math.random() - 0.5) * size;
        } 
        else if (type === 'heart') {
             // Heart parametric equation
             const t = Math.random() * Math.PI * 2;
             // Simple 3D Approximation:
             const r = 2; 
             x = 16 * Math.pow(Math.sin(t), 3) * r;
             y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r;
             z = (Math.random() - 0.5) * 20; // Thickness
             
             // Randomize slightly to fill volume
             x += (Math.random() - 0.5) * 2;
             y += (Math.random() - 0.5) * 2;
        }
        else if (type === 'helix') {
            const t = i * 0.1;
            x = Math.cos(t) * 20;
            z = Math.sin(t) * 20;
            y = (i / count - 0.5) * 100;
        }

        positions[idx] = x;
        positions[idx + 1] = y;
        positions[idx + 2] = z;
    }
    return positions;
};

interface HandParticleSystemProps {
    onClose: () => void;
}

export const HandParticleSystem: React.FC<HandParticleSystemProps> = ({ onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [color, setColor] = useState('#a5f3fc');
    const [shape, setShape] = useState<ShapeType>('sphere');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [handStatus, setHandStatus] = useState<string>('寻找手势... Searching...');
    const [openness, setOpenness] = useState(1); // 0 (closed) to 1 (open)

    // Three.js Refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const particlesRef = useRef<THREE.Points | null>(null);
    const geometryRef = useRef<THREE.BufferGeometry | null>(null);
    const frameIdRef = useRef<number>(0);
    
    // Logic Refs
    const targetPositionsRef = useRef<Float32Array>(generateShape('sphere', 15000));
    const opennessRef = useRef(1); // Raw input from MediaPipe
    const smoothedOpennessRef = useRef(1); // Smoothed value for animation loop

    useEffect(() => {
        initThree();
        initMediaPipe();
        return () => {
            cleanup();
        };
    }, []);

    // Re-generate target positions when shape changes
    useEffect(() => {
        targetPositionsRef.current = generateShape(shape, 15000);
    }, [shape]);

    // Update material color
    useEffect(() => {
        if (particlesRef.current) {
            (particlesRef.current.material as THREE.PointsMaterial).color.set(color);
        }
    }, [color]);

    const initThree = () => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050505, 0.002);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        // Particles
        const particleCount = 15000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        // Start random
        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 200;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: new THREE.Color(color),
            size: 0.8,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        particlesRef.current = particles;
        geometryRef.current = geometry;

        animate();

        window.addEventListener('resize', handleResize);
    };

    const handleResize = () => {
        if (cameraRef.current && rendererRef.current) {
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        }
    };

    const animate = () => {
        frameIdRef.current = requestAnimationFrame(animate);
        
        // Smoothly interpolate the openness value to prevent jitter
        // Lerp factor 0.1 gives a responsive yet smooth feel
        smoothedOpennessRef.current += (opennessRef.current - smoothedOpennessRef.current) * 0.1;

        if (particlesRef.current && geometryRef.current) {
            const positions = geometryRef.current.attributes.position.array as Float32Array;
            const targets = targetPositionsRef.current;
            const count = positions.length / 3;
            
            // Interaction Factor based on Smoothed Hand Openness
            const targetFactor = smoothedOpennessRef.current;
            
            // Rotation based on state
            // Spin faster when closed/imploding
            const rotationSpeed = 0.001 + (1 - targetFactor) * 0.005;
            particlesRef.current.rotation.y += rotationSpeed;
            particlesRef.current.rotation.x += 0.0005;

            for (let i = 0; i < count; i++) {
                const idx = i * 3;
                
                // Calculate desired position
                let tx, ty, tz;
                
                if (targetFactor > 0.1) {
                    // Go to Target Shape
                    // Add slight breathing effect based on openness
                    const scale = 0.5 + targetFactor * 0.5;
                    tx = targets[idx] * scale; 
                    ty = targets[idx + 1] * scale;
                    tz = targets[idx + 2] * scale;
                } else {
                    // Implode to center (Singularity)
                    // Add some noise so they don't all occupy 0,0,0 perfectly
                    tx = (Math.random() - 0.5) * 2;
                    ty = (Math.random() - 0.5) * 2;
                    tz = (Math.random() - 0.5) * 2;
                }

                // Particle Interpolation (Physics)
                // Use a dynamic speed: faster when imploding (closing hand), slower when expanding (opening hand)
                // This creates a "snap" shut and "drift" open feel.
                const speed = targetFactor < 0.2 ? 0.12 : 0.06;

                positions[idx] += (tx - positions[idx]) * speed;
                positions[idx + 1] += (ty - positions[idx + 1]) * speed;
                positions[idx + 2] += (tz - positions[idx + 2]) * speed;
            }

            geometryRef.current.attributes.position.needsUpdate = true;
        }

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
    };

    const initMediaPipe = async () => {
        const { Hands, Camera } = (window as any);
        if (!Hands || !Camera) {
            console.error("MediaPipe not loaded");
            setHandStatus("MediaPipe Failed Load");
            return;
        }

        const hands = new Hands({locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }});

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];
                
                // Calculate "Openness"
                // Heuristic: Average distance of fingertips from wrist
                const wrist = landmarks[0];
                const tips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
                let totalDist = 0;
                
                tips.forEach(idx => {
                    const tip = landmarks[idx];
                    const d = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
                    totalDist += d;
                });
                
                const avgDist = totalDist / 5;
                
                // Calibrate for typical screen coordinates:
                // Fist ~0.15 or less, Open Palm ~0.35-0.45
                let val = (avgDist - 0.15) / 0.25;
                val = Math.max(0, Math.min(1, val));
                
                opennessRef.current = val;
                setOpenness(val); // For UI update
                setHandStatus(val > 0.5 ? "手掌张开 · 扩散" : "拳头紧握 · 收缩");

            } else {
                setHandStatus("未检测到手势 No Hand");
                // Slowly return to open state if hand is lost, so particles don't get stuck in void
                if(opennessRef.current < 1) opennessRef.current += 0.02;
            }
        });

        if (videoRef.current) {
            try {
                const camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if(videoRef.current) await hands.send({image: videoRef.current});
                    },
                    width: 320,
                    height: 240
                });
                const startPromise = camera.start();
                if (startPromise && typeof startPromise.catch === 'function') {
                    startPromise.catch((err: any) => {
                        console.warn("HandParticleSystem camera permission not granted or device unavailable:", err?.message || err);
                        setHandStatus("摄像头权限受限");
                    });
                }
            } catch (err: any) {
                console.warn("HandParticleSystem camera initialization error:", err?.message || err);
                setHandStatus("摄像头未就绪");
            }
        }
    };

    const cleanup = () => {
        cancelAnimationFrame(frameIdRef.current);
        if (rendererRef.current && containerRef.current) {
            containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current?.dispose();
        window.removeEventListener('resize', handleResize);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black text-white"
        >
            {/* 3D Container */}
            <div ref={containerRef} className="w-full h-full cursor-move" />

            {/* Hidden Video for MediaPipe */}
            <video ref={videoRef} className="hidden" playsInline muted />

            {/* UI Overlay */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-4 w-64">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <h2 className="text-lg font-serif tracking-wider">粒子交互控制</h2>
                        <button onClick={onClose} className="hover:text-red-400 transition-colors"><X size={20} /></button>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 text-xs text-white/60">
                         <div className={`w-2 h-2 rounded-full ${openness > 0.5 ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'} transition-all`} />
                         <span>{handStatus}</span>
                    </div>

                    {/* Shapes */}
                    <div>
                        <label className="text-xs text-white/40 uppercase mb-2 block">模型生成 Pattern</label>
                        <div className="grid grid-cols-4 gap-2">
                            <button onClick={() => setShape('sphere')} className={`p-2 rounded border transition-all ${shape === 'sphere' ? 'bg-white text-black border-white' : 'border-white/20 hover:bg-white/10'}`}><Circle size={16} className="mx-auto"/></button>
                            <button onClick={() => setShape('cube')} className={`p-2 rounded border transition-all ${shape === 'cube' ? 'bg-white text-black border-white' : 'border-white/20 hover:bg-white/10'}`}><Box size={16} className="mx-auto"/></button>
                            <button onClick={() => setShape('heart')} className={`p-2 rounded border transition-all ${shape === 'heart' ? 'bg-white text-black border-white' : 'border-white/20 hover:bg-white/10'}`}><Heart size={16} className="mx-auto"/></button>
                            <button onClick={() => setShape('helix')} className={`p-2 rounded border transition-all ${shape === 'helix' ? 'bg-white text-black border-white' : 'border-white/20 hover:bg-white/10'}`}><Activity size={16} className="mx-auto"/></button>
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="text-xs text-white/40 uppercase mb-2 block">视觉定制 Color</label>
                        <div className="flex items-center gap-2">
                            <Palette size={16} className="text-white/60" />
                            <input 
                                type="color" 
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full h-8 bg-transparent cursor-pointer rounded overflow-hidden" 
                            />
                        </div>
                    </div>
                    
                    {/* Fullscreen */}
                    <button 
                        onClick={toggleFullscreen}
                        className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
                    >
                        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        {isFullscreen ? "退出全屏" : "全屏沉浸"}
                    </button>
                    
                    <div className="text-[10px] text-white/30 leading-relaxed mt-2 border-t border-white/5 pt-2">
                        说明：请授权摄像头。对着摄像头张开手掌粒子扩散，握拳粒子收缩。
                    </div>
                </div>

                {/* Camera Preview (Mini) */}
                <div className="pointer-events-auto w-32 h-24 bg-black/60 rounded-xl overflow-hidden border border-white/10 relative">
                     <Camera size={16} className="absolute top-2 left-2 text-white/60 z-10" />
                     <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 text-center px-2">
                        摄像头捕捉中...<br/>Camera Active
                     </div>
                </div>
            </div>
        </motion.div>
    );
};
