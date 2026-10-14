
import React, { useEffect, useRef } from 'react';

interface GestureControllerProps {
  onOpennessChange: (val: number) => void;
  isActive: boolean;
}

export const GestureController: React.FC<GestureControllerProps> = ({ onOpennessChange, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number>(0);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!isActive) {
      if (cameraRef.current) {
        // Stop camera logic if we can, mainly by stopping the loop
      }
      return;
    }

    const initMediaPipe = async () => {
        const { Hands, Camera } = (window as any);
        if (!Hands || !Camera) return;

        const hands = new Hands({locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }});

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 0, // Lower complexity for background performance
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];
                const wrist = landmarks[0];
                const tips = [4, 8, 12, 16, 20];
                let totalDist = 0;
                
                tips.forEach(idx => {
                    const tip = landmarks[idx];
                    const d = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
                    totalDist += d;
                });
                
                const avgDist = totalDist / 5;
                // Calibrate for normalized screen coordinates
                // 0.15 is closed fist usually, 0.4 is wide open
                let val = (avgDist - 0.15) / 0.25;
                val = Math.max(0, Math.min(1.5, val)); // Allow some over-extension
                
                onOpennessChange(val);
            }
        });

        handsRef.current = hands;

        if (videoRef.current) {
            try {
                const camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if (videoRef.current && handsRef.current && isActive) {
                           await handsRef.current.send({image: videoRef.current});
                        }
                    },
                    width: 320,
                    height: 240
                });
                cameraRef.current = camera;
                const startPromise = camera.start();
                if (startPromise && typeof startPromise.catch === 'function') {
                    startPromise.catch((err: any) => {
                        console.warn("GestureController camera permission not granted or device unavailable:", err?.message || err);
                    });
                }
            } catch (err: any) {
                console.warn("GestureController camera initialization error:", err?.message || err);
            }
        }
    };

    initMediaPipe();

    // Cleanup not fully possible with MediaPipe Camera utils without reloading page usually,
    // but we stop processing via isActive check in loop.
  }, [isActive]);

  return (
    <video ref={videoRef} className="hidden" playsInline muted />
  );
};
