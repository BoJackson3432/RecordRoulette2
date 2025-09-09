import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createPortal } from "react-dom";

interface NewTrophy {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  iconName: string;
  earnedAt: string;
}

interface AchievementNotificationProps {
  newTrophies: NewTrophy[];
  onClose: () => void;
  userStats?: {
    totalSpins: number;
    currentStreak: number;
    longestStreak: number;
    listenedSpins: number;
  };
}

export default function AchievementNotification({ 
  newTrophies, 
  onClose, 
  userStats 
}: AchievementNotificationProps) {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!newTrophies.length || !isVisible) return null;

  const currentTrophy = newTrophies[currentIndex];
  
  const tierColors = {
    bronze: {
      bg: 'from-amber-600 to-amber-700',
      border: 'border-amber-500',
      glow: 'shadow-amber-500/40',
      text: 'text-amber-300'
    },
    silver: {
      bg: 'from-gray-400 to-gray-600', 
      border: 'border-gray-300',
      glow: 'shadow-gray-400/40',
      text: 'text-gray-200'
    },
    gold: {
      bg: 'from-yellow-400 to-yellow-600',
      border: 'border-yellow-300',
      glow: 'shadow-yellow-400/50',
      text: 'text-yellow-200'
    },
    diamond: {
      bg: 'from-cyan-400 to-blue-500',
      border: 'border-cyan-300',
      glow: 'shadow-cyan-400/60',
      text: 'text-cyan-100'
    }
  };

  const colors = tierColors[currentTrophy.tier as keyof typeof tierColors] || tierColors.bronze;

  const getShareText = (trophy: NewTrophy) => {
    const statValue = getRelevantStat(trophy);
    
    return {
      instagram: `🏆 ACHIEVEMENT UNLOCKED 🏆\n\n${trophy.name}\n${trophy.description}\n\n✨ Just hit ${statValue} on RecordRoulette!\n\nWho else is on their music discovery journey?\n\n#RecordRoulette #Achievement #MusicGoals #${trophy.tier}Trophy #MusicDiscovery`,
      
      twitter: `🏆 ${trophy.name} achievement unlocked!\n\n${statValue} milestone reached on @RecordRoulette\n\nDaily music discovery > endless playlist scrolling 🎵\n\n#RecordRoulette #MusicAchievement`,
      
      tiktok: `🏆 POV: You just unlocked "${trophy.name}"\n\n✨ ${trophy.description}\n🎰 RecordRoulette keeping me motivated\n💿 ${statValue} and counting\n\n#RecordRoulette #Achievement #MusicTok #VinylLife`,
      
      general: `🏆 Just unlocked "${trophy.name}" on RecordRoulette!\n\n${trophy.description}\n\nDaily album discoveries are keeping my music taste fresh ✨\n\n${window.location.origin}?ref=achievement`
    };
  };

  const getRelevantStat = (trophy: NewTrophy): string => {
    if (!userStats) return "milestone";
    
    switch (trophy.category) {
      case 'streak':
        return `${userStats.currentStreak} day streak`;
      case 'discovery':
        return `${userStats.totalSpins} albums discovered`;
      case 'social':
        return `${userStats.listenedSpins} albums fully listened`;
      default:
        return "achievement";
    }
  };

  const handleNext = () => {
    if (currentIndex < newTrophies.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const handleShare = async (platform: 'instagram' | 'twitter' | 'general') => {
    const shareTexts = getShareText(currentTrophy);
    const text = shareTexts[platform];
    
    try {
      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
      } else if (navigator.share && platform === 'general') {
        await navigator.share({
          title: `🏆 ${currentTrophy.name}`,
          text: text
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast({
          title: "🎉 Achievement copied!",
          description: `Perfect for ${platform === 'instagram' ? 'Instagram' : 'sharing'}!`,
        });
      }
    } catch (error) {
      // Silent fail if user cancels
    }
  };

  // Render into a portal for overlay
  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative max-w-md w-full"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.6 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Celebration particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                  initial={{ 
                    x: "50%", 
                    y: "50%", 
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 300}%`,
                    y: `${50 + (Math.random() - 0.5) * 300}%`,
                    scale: [0, 1, 0],
                    rotate: 360
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>

            <Card className={`relative overflow-hidden border-2 ${colors.border} ${colors.glow} shadow-2xl`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-20`}></div>
              
              <CardContent className="p-8 text-center relative z-10">
                {/* Header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="mb-4"
                >
                  <div className="text-4xl mb-2">🎉</div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Achievement Unlocked!
                  </h2>
                </motion.div>

                {/* Trophy Icon */}
                <motion.div 
                  className="mb-6"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center text-3xl text-white shadow-xl mb-4`}>
                    🏆
                  </div>
                  
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 bg-gradient-to-r ${colors.bg} text-white`}>
                    {currentTrophy.tier.toUpperCase()}
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {currentTrophy.name}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm">
                    {currentTrophy.description}
                  </p>
                </motion.div>

                {/* Share Options */}
                <div className="space-y-3 mb-6">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleShare('instagram')}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-pink-500/30 hover:bg-pink-500/10"
                    >
                      <i className="fab fa-instagram text-pink-500 mr-2"></i>
                      Instagram
                    </Button>
                    
                    <Button
                      onClick={() => handleShare('twitter')}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-blue-400/30 hover:bg-blue-400/10"
                    >
                      <i className="fab fa-twitter text-blue-400 mr-2"></i>
                      Tweet
                    </Button>
                  </div>
                  
                  <Button
                    onClick={() => handleShare('general')}
                    variant="outline"
                    className="w-full"
                  >
                    <i className="fas fa-share mr-2"></i>
                    Share Achievement
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  {newTrophies.length > 1 && (
                    <div className="text-xs text-muted-foreground">
                      {currentIndex + 1} of {newTrophies.length}
                    </div>
                  )}
                  
                  <div className="flex gap-2 ml-auto">
                    {currentIndex < newTrophies.length - 1 ? (
                      <Button
                        onClick={handleNext}
                        size="sm"
                        className={`bg-gradient-to-r ${colors.bg} hover:opacity-90`}
                      >
                        Next <i className="fas fa-arrow-right ml-2"></i>
                      </Button>
                    ) : (
                      <Button
                        onClick={handleClose}
                        size="sm"
                        variant="outline"
                      >
                        <i className="fas fa-times mr-2"></i>
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}