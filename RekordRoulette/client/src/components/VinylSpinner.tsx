import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useVinylSound } from "@/hooks/useVinylSound";

interface VinylSpinnerProps {
  isSpinning: boolean;
  onSpinComplete?: () => void;
  disabled?: boolean;
  selectedMode?: string;
}

export default function VinylSpinner({ isSpinning, onSpinComplete, disabled, selectedMode }: VinylSpinnerProps) {
  const [hasSpun, setHasSpun] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { playVinylRewindSound, stopVinylSound } = useVinylSound();
  
  const isRoulette = selectedMode === 'roulette';

  // Parallax motion values - simplified for better performance
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useTransform(mouseY, [-100, 100], [2, -2]);
  const rotateY = useTransform(mouseX, [-100, 100], [-2, 2]);
  const scale = useTransform(mouseX, [-100, 100], [0.98, 1.02]);

  // Throttled mouse move handler for better performance
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || isSpinning) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const offsetX = e.clientX - centerX;
    const offsetY = e.clientY - centerY;
    
    mouseX.set(offsetX / 4);
    mouseY.set(offsetY / 4);
  }, [isSpinning, mouseX, mouseY]);

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  // Synchronize vinyl rewind sound with spinning animation
  useEffect(() => {
    if (isSpinning) {
      // Start audio exactly when animation begins
      playVinylRewindSound();
    } else {
      // Stop audio if spinning is interrupted
      stopVinylSound();
    }
    
    // Cleanup when component unmounts or spinning changes
    return () => {
      if (!isSpinning) {
        stopVinylSound();
      }
    };
  }, [isSpinning, playVinylRewindSound, stopVinylSound]);

  return (
    <div 
      ref={ref}
      className="relative mx-auto w-80 h-80 md:w-96 md:h-96" 
      data-testid="vinyl-spinner"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
    >
      {/* Vinyl Record with dynamic rim color */}
      <motion.div 
        className="absolute inset-0 rounded-full border-4 shadow-2xl"
        style={{ 
          borderColor: isRoulette ? "#dc2626" : "#10b981",
          rotateX,
          rotateY,
          scale: isSpinning ? 1 : scale,
        }}
        animate={isSpinning ? { 
          boxShadow: isRoulette ? 
            '0 0 40px rgba(220, 38, 38, 0.6)' : 
            '0 0 40px rgba(16, 185, 129, 0.6)',
          borderColor: isRoulette ? "#dc2626" : "#10b981"
        } : isRoulette ? { borderColor: "#dc2626" } : {}}
        initial={isRoulette ? { borderColor: "#10b981" } : {}}
        transition={{ duration: isRoulette ? 1.5 : 1.5, ease: "easeInOut", repeat: isSpinning ? Infinity : 0 }}
      >
        {/* Vinyl record surface */}
        <motion.div
          className="w-full h-full rounded-full relative overflow-hidden"
          style={{
            background: isRoulette 
              ? "radial-gradient(circle at 40% 40%, #4a1a1a 0%, #3a1515 20%, #2a1010 40%, #1a0808 70%, #0f0404 100%)"
              : "radial-gradient(circle at 40% 40%, #333333 0%, #2a2a2a 20%, #1a1a1a 40%, #0f0f0f 70%, #0a0a0a 100%)",
          }}
          animate={isSpinning ? { rotate: [0, 720, 1800, 2160] } : { rotate: 0 }}
          transition={{ 
            duration: isSpinning ? 3.5 : 0.3, 
            ease: isSpinning ? [0.1, 0.4, 0.7, 0.95] : "easeOut",
            times: isSpinning ? [0, 0.3, 0.8, 1] : undefined,
            onComplete: () => {
              if (isSpinning) {
                // Force immediate audio stop - multiple calls to ensure it stops
                stopVinylSound();
                setTimeout(() => stopVinylSound(), 0);
                setTimeout(() => stopVinylSound(), 10);
                setHasSpun(true);
                onSpinComplete?.();
              }
            }
          }}
        >
          {/* Center label - enhanced with gradient and glow */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center z-20 shadow-lg"
            style={{ 
              background: isRoulette 
                ? "radial-gradient(circle at 30% 30%, #dc2626, #b91c1c, #991b1b)"
                : "radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b, #d97706)",
              boxShadow: isSpinning 
                ? isRoulette ? "0 0 20px rgba(220, 38, 38, 0.6)" : "0 0 20px rgba(245, 158, 11, 0.6)"
                : isRoulette ? "0 0 10px rgba(220, 38, 38, 0.3)" : "0 0 10px rgba(245, 158, 11, 0.3)"
            }}
            animate={isSpinning ? { 
              boxShadow: isRoulette ? [
                "0 0 15px rgba(220, 38, 38, 0.4)", 
                "0 0 25px rgba(220, 38, 38, 0.8)", 
                "0 0 15px rgba(220, 38, 38, 0.4)"
              ] : [
                "0 0 15px rgba(245, 158, 11, 0.4)", 
                "0 0 25px rgba(245, 158, 11, 0.8)", 
                "0 0 15px rgba(245, 158, 11, 0.4)"
              ]
            } : {}}
            transition={{ duration: 2, ease: "easeInOut", repeat: isSpinning ? Infinity : 0 }}
          >
            <motion.i 
              className={`fas ${isRoulette ? 'fa-crosshairs' : 'fa-music'} text-white text-3xl`}
              animate={isSpinning ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2.5, ease: "easeInOut", repeat: isSpinning ? Infinity : 0 }}
            ></motion.i>
          </motion.div>
          
          {/* Russian Roulette bullet hole effect with explosion */}
          {isRoulette && (
            <>
              {/* Explosion particles - simultaneous with bullet hole */}
              <motion.div
                className="absolute top-1/4 right-1/3 w-8 h-8 pointer-events-none z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                {/* Multiple explosion particles */}
                {Array.from({ length: 8 }, (_, i) => {
                  const angle = (i * 45) * (Math.PI / 180);
                  const distance = 15 + Math.random() * 10;
                  const x = Math.cos(angle) * distance;
                  const y = Math.sin(angle) * distance;
                  
                  return (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                        boxShadow: "0 0 4px rgba(255, 193, 7, 0.8)"
                      }}
                      initial={{ 
                        scale: 0,
                        x: 0,
                        y: 0,
                        opacity: 1
                      }}
                      animate={{ 
                        scale: [0, 1.5, 0],
                        x: x,
                        y: y,
                        opacity: [1, 1, 0]
                      }}
                      transition={{ 
                        duration: 0.4,
                        delay: 0.5,
                        ease: "easeOut"
                      }}
                    />
                  );
                })}
                
                {/* Central flash */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full"
                  style={{
                    boxShadow: "0 0 15px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 193, 7, 0.6)"
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                />
              </motion.div>

              {/* Bullet hole - simultaneous with explosion */}
              <motion.div
                className="absolute top-1/4 right-1/3 w-3 h-3 bg-black rounded-full z-15"
                style={{
                  boxShadow: "inset 0 0 4px rgba(0,0,0,0.8), 0 0 2px rgba(220, 38, 38, 0.5)"
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
              />

              {/* Smoke effect */}
              <motion.div
                className="absolute top-1/4 right-1/3 w-6 h-6 pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{ duration: 1.5, delay: 0.8 }}
              >
                <div 
                  className="w-full h-full rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(100,100,100,0.3) 0%, rgba(150,150,150,0.2) 30%, transparent 70%)",
                    filter: "blur(2px)"
                  }}
                />
              </motion.div>
            </>
          )}
          
          {/* Simplified vinyl grooves for better performance */}
          {Array.from({ length: 15 }, (_, i) => {
            const inset = i * 2 + 2;
            const opacity = Math.max(0.15, 0.4 - (i * 0.02));
            const isEmphasized = i % 2 === 0;
            return (
              <div 
                key={i}
                className={`absolute rounded-full border ${isEmphasized ? 'border-gray-400' : 'border-gray-500'}`}
                style={{ 
                  inset: `${inset * 4}px`,
                  opacity: isEmphasized ? opacity * 1.3 : opacity,
                  borderWidth: '0.5px'
                }}
              />
            );
          })}
          
          {/* Enhanced texture overlay with light reflection */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.03) 25%, transparent 50%, rgba(255,255,255,0.02) 75%, transparent 100%)",
              opacity: 0.6
            }}
            animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 8, ease: "linear", repeat: isSpinning ? Infinity : 0 }}
          />
          
          {/* Vinyl surface texture */}
          <div className="absolute inset-0 rounded-full opacity-40"
               style={{
                 background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, transparent 20%, rgba(0,0,0,0.05) 40%, transparent 60%, rgba(0,0,0,0.03) 80%, transparent 100%)"
               }}
          />
          
          {/* Spindle hole */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full z-30"></div>
        </motion.div>
      </motion.div>
      
      {/* Spinner pointer */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-accent z-20"></div>

      {/* Loading state overlay */}
      <AnimatePresence>
        {isSpinning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/20 rounded-full z-30"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-primary text-2xl mb-2"
              >
                <i className="fas fa-compact-disc"></i>
              </motion.div>
              <p className="text-sm text-muted-foreground font-medium">
                Finding your album...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
