
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!isActive) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      cancelAnimationFrame(animationRef.current);
      return;
    }

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256; 
        analyser.smoothingTimeConstant = 0.95; // Extremely smooth
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);

        // Initialize particles - Fewer, larger, softer
        particlesRef.current = Array.from({ length: 80 }).map(() => ({
            angle: Math.random() * Math.PI * 2,
            radius: 40 + Math.random() * 80,
            baseRadius: 40 + Math.random() * 80,
            speed: (Math.random() - 0.5) * 0.002, // Ultra slow rotation
            size: Math.random() * 4 + 2, // Larger but blurrier
            alpha: Math.random() * 0.3, // Lower alpha
            colorHsl: Math.random() * 40 + 170 // Cyan/Teal range (Soft)
        }));

        draw();
      } catch (err: any) {
        console.warn("Microphone access not granted or unavailable:", err?.message || err);
      }
    };

    initAudio();

    return () => {
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive]);

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
      const avgVolume = sum / bufferLength;
      
      // Clear with very high transparency for long trails
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Use screen blending for softer light
      ctx.globalCompositeOperation = 'screen'; 

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // 1. Soft Breath Aura (Blurry)
      // We draw this using shadowBlur for maximum softness
      const coreSize = 20 + avgVolume * 0.3;
      ctx.shadowBlur = 40;
      ctx.shadowColor = `hsla(180, 80%, 60%, ${0.1 + avgVolume/400})`;
      ctx.fillStyle = `hsla(180, 80%, 60%, ${0.05 + avgVolume/600})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset

      // 2. Floating Ethereal Particles (Bokeh style)
      particlesRef.current.forEach(p => {
          const volumePush = avgVolume * 0.8;
          const currentRadius = p.baseRadius + volumePush;
          
          p.angle += p.speed;
          
          const x = centerX + Math.cos(p.angle) * currentRadius;
          const y = centerY + Math.sin(p.angle) * currentRadius;

          // Smooth alpha transition
          const alpha = p.alpha * (0.3 + avgVolume / 250);
          
          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          // Use low saturation for pastel look
          ctx.fillStyle = `hsla(${p.colorHsl}, 60%, 75%, ${alpha})`; 
          ctx.fill();
      });

      // 3. Very subtle Wave Ring
      if (avgVolume > 10) {
        ctx.beginPath();
        const radius = 50 + avgVolume * 0.3;
        for (let i = 0; i <= bufferLength; i+=2) { // Skip points for smoother curve
            const angle = (i / bufferLength) * Math.PI * 2;
            const r = radius + (dataArray[i] * 0.15); 
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + avgVolume/800})`; // Almost invisible
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
  };

  return (
    <canvas 
        ref={canvasRef} 
        width={800} 
        height={800} 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 scale-110 filter blur-[1px]"
    />
  );
};
