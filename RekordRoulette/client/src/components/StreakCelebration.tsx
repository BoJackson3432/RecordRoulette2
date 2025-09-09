import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StreakCelebrationProps {
  isOpen: boolean;
  streak: number;
  onClose: () => void;
}

// Confetti component
function Confetti({ isActive }: { isActive: boolean }) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; y: number; rotation: number; color: string }>>([]);

  useEffect(() => {
    if (isActive) {
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setPieces(newPieces);

      // Clear confetti after animation
      const timer = setTimeout(() => setPieces([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded"
          style={{ 
            backgroundColor: piece.color,
            left: `${piece.x}%`,
          }}
          initial={{ 
            y: -20,
            rotate: piece.rotation,
            scale: 0
          }}
          animate={{ 
            y: window.innerHeight + 50,
            rotate: piece.rotation + 720,
            scale: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: 3,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}

export default function StreakCelebration({ isOpen, streak, onClose }: StreakCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Stop confetti after 3 seconds
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getMilestoneData = (streak: number) => {
    if (streak >= 30) {
      return {
        icon: Crown,
        title: "Legend Status!",
        description: `${streak} day streak - You're a music discovery legend!`,
        message: "Your dedication to musical exploration is truly inspiring. Keep this incredible streak alive!",
        color: "from-yellow-500 to-orange-500",
        bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
      };
    } else if (streak >= 14) {
      return {
        icon: Star,
        title: "Two Week Warrior!",
        description: `${streak} day streak - Halfway to legend status!`,
        message: "Two weeks of consistent discovery! You're building an amazing musical journey.",
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
      };
    } else if (streak >= 7) {
      return {
        icon: Trophy,
        title: "Week Champion!",
        description: `${streak} day streak - A full week of discovery!`,
        message: "One week of daily musical exploration! You're developing an excellent habit.",
        color: "from-blue-500 to-indigo-500",
        bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
      };
    } else {
      return {
        icon: Flame,
        title: "Hot Streak!",
        description: `${streak} day streak - You're on fire!`,
        message: "Great start! Keep the momentum going and build towards your first week.",
        color: "from-red-500 to-pink-500",
        bgColor: "bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20"
      };
    }
  };

  const milestoneData = getMilestoneData(streak);
  const Icon = milestoneData.icon;

  if (!isOpen) return null;

  return (
    <>
      <Confetti isActive={showConfetti} />
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`${milestoneData.bgColor} rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/20`}
        >
          {/* Celebration Header */}
          <div className={`bg-gradient-to-r ${milestoneData.color} p-6 text-white text-center relative overflow-hidden`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="relative z-10"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{milestoneData.title}</h2>
              <p className="text-white/90 text-lg">{milestoneData.description}</p>
            </motion.div>
            
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <motion.div
                className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full"
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute -bottom-5 -left-5 w-12 h-12 bg-white/10 rounded-full"
                animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 text-center"
          >
            <p className="text-muted-foreground leading-relaxed mb-6">
              {milestoneData.message}
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Current</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{streak}</div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>

            <Button
              onClick={onClose}
              className={`bg-gradient-to-r ${milestoneData.color} hover:opacity-90 text-white shadow-lg`}
              data-testid="button-close-streak-celebration"
            >
              Continue Discovery Journey
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}