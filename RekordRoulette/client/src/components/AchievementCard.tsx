import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  milestone: number;
  type: 'streak' | 'discovery' | 'listening' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementCardProps {
  achievement: Achievement;
  userStats: {
    name: string;
    value: number;
  };
  onShare?: () => void;
}

export default function AchievementCard({ achievement, userStats, onShare }: AchievementCardProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const rarityColors = {
    common: {
      bg: 'from-gray-500 to-gray-600',
      border: 'border-gray-400',
      glow: 'shadow-gray-400/20'
    },
    rare: {
      bg: 'from-blue-500 to-blue-600', 
      border: 'border-blue-400',
      glow: 'shadow-blue-400/30'
    },
    epic: {
      bg: 'from-purple-500 to-purple-600',
      border: 'border-purple-400', 
      glow: 'shadow-purple-400/40'
    },
    legendary: {
      bg: 'from-yellow-400 to-orange-500',
      border: 'border-yellow-300',
      glow: 'shadow-yellow-300/50'
    }
  };

  const colors = rarityColors[achievement.rarity];

  const generateShareText = () => {
    const achievements = {
      streak: `🔥 ${userStats.value} day listening streak achieved!\n\nDaily album discoveries on RecordRoulette are keeping my music taste fresh ✨\n\n#RecordRoulette #MusicStreak #ListeningGoals #${userStats.value}DayStreak`,
      discovery: `🎰 Just discovered my ${userStats.value}${getOrdinalSuffix(userStats.value)} album on RecordRoulette!\n\nWho else is expanding their music taste daily? 🎵\n\n#RecordRoulette #MusicDiscovery #${userStats.value}Albums #VinylLife`,
      listening: `🎵 ${userStats.value} hours of full album listening unlocked!\n\nRecordRoulette is bringing back the art of deep listening 🎧\n\n#RecordRoulette #FullAlbumExperience #${userStats.value}Hours #MusicAppreciation`,
      social: `📱 Shared ${userStats.value} incredible discoveries with friends!\n\nSpreading great music one album at a time 🎶\n\n#RecordRoulette #MusicSharing #${userStats.value}Shares #ViralMusic`
    };
    
    return achievements[achievement.type];
  };

  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd"; 
    if (j == 3 && k != 13) return "rd";
    return "th";
  };

  const handleShare = async () => {
    setIsSharing(true);
    const shareText = generateShareText();
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `🏆 ${achievement.title}`,
          text: shareText,
          url: `${window.location.origin}?ref=achievement`
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "🎉 Achievement Copied!",
          description: "Paste to share your milestone on social media",
        });
      }
    } catch (error) {
      // Silent fail if user cancels
    } finally {
      setIsSharing(false);
      onShare?.();
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
      className="relative"
    >
      {/* Celebration particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            initial={{ 
              x: "50%", 
              y: "50%", 
              scale: 0,
              opacity: 1
            }}
            animate={{
              x: `${50 + (Math.random() - 0.5) * 200}%`,
              y: `${50 + (Math.random() - 0.5) * 200}%`,
              scale: [0, 1, 0],
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      <Card className={`relative overflow-hidden border-2 ${colors.border} ${colors.glow} shadow-2xl`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-10`}></div>
        
        <CardContent className="p-8 text-center relative z-10">
          {/* Trophy/Achievement Icon */}
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
            <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center text-4xl text-white shadow-xl`}>
              <i className={achievement.icon}></i>
            </div>
          </motion.div>

          {/* Achievement Details */}
          <div className="mb-6">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-gradient-to-r ${colors.bg} text-white`}>
              {achievement.rarity.toUpperCase()}
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">
              🏆 {achievement.title}
            </h3>
            
            <p className="text-muted-foreground mb-4">
              {achievement.description}
            </p>

            <div className="text-3xl font-bold text-primary mb-2">
              {userStats.value.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {userStats.name}
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleShare}
              disabled={isSharing}
              className={`w-full bg-gradient-to-r ${colors.bg} hover:opacity-90 text-white font-semibold py-3`}
              data-testid="button-share-achievement"
            >
              {isSharing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <i className="fas fa-share mr-2"></i>
                  Share Achievement
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const instagramText = `🏆 ACHIEVEMENT UNLOCKED 🏆\n\n${achievement.title}\n${userStats.value} ${userStats.name}\n\n✨ RecordRoulette is keeping my music game strong\n\n#RecordRoulette #Achievement #MusicGoals #${achievement.rarity}Achievement`;
                  navigator.clipboard.writeText(instagramText);
                  toast({
                    title: "Instagram text copied!",
                    description: "Perfect for your Stories or Posts"
                  });
                }}
                className="flex-1 border-pink-500/30 hover:bg-pink-500/10"
              >
                <i className="fab fa-instagram text-pink-500 mr-2"></i>
                Instagram
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const tweetText = `🏆 ${achievement.title} achieved!\n\n${userStats.value} ${userStats.name} on @RecordRoulette\n\nDaily music discovery > endless playlist scrolling\n\n#RecordRoulette #MusicAchievement`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                }}
                className="flex-1 border-blue-400/30 hover:bg-blue-400/10"
              >
                <i className="fab fa-twitter text-blue-400 mr-2"></i>
                Tweet
              </Button>
            </div>
          </div>

          {/* RecordRoulette Branding */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Achieved on <span className="font-semibold text-primary">RecordRoulette</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}