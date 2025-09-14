import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ProfileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: {
    totalSpins: number;
    currentStreak: number;
    longestStreak: number;
    favoritesCount: number;
    trophiesEarned: number;
  };
  userProfile: {
    displayName: string;
    topGenres?: string[];
  };
}

export default function ProfileShareModal({ 
  isOpen, 
  onClose, 
  userStats,
  userProfile 
}: ProfileShareModalProps) {
  const { toast } = useToast();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const shareTexts = {
    stats: `🎵 My RecordRoulette Stats 🎵\n\n🎰 ${userStats.totalSpins} albums discovered\n🔥 ${userStats.currentStreak} day current streak\n🏆 ${userStats.longestStreak} days longest streak\n💎 ${userStats.trophiesEarned} achievements earned\n\nDaily music discovery is changing my taste!\n\n#RecordRoulette #MusicStats #DiscoveryJourney`,
    
    instagramStats: `📊 MY MUSIC YEAR IN REVIEW 📊\n\n🎰 Discovered: ${userStats.totalSpins} albums\n🔥 Current streak: ${userStats.currentStreak} days\n🏆 Best streak: ${userStats.longestStreak} days\n💎 Achievements: ${userStats.trophiesEarned}\n\nRecordRoulette is keeping my music taste fresh!\n\nWho else needs better music discovery?\n\n#RecordRoulette #MusicStats #VinylLife #MusicYear`,
    
    challenge: `🎯 MUSIC CHALLENGE: Join me on RecordRoulette!\n\nCurrent stats:\n🎰 ${userStats.totalSpins} albums explored\n🔥 ${userStats.currentStreak} day streak\n🏆 ${userStats.trophiesEarned} achievements\n\nDaily album discovery > endless playlist scrolling\n\nWho's starting their music journey with me? 👇\n\n#RecordRouletteChallenge #MusicDiscovery #JoinMe`,
    
    streakPost: `🔥 ${userStats.currentStreak} DAY STREAK on RecordRoulette! 🔥\n\n"Daily music discovery keeps my taste evolving"\n\nBest streak: ${userStats.longestStreak} days 📈\nTotal albums: ${userStats.totalSpins} 🎵\n\nWho else is on a discovery streak?\n\n#RecordRoulette #MusicStreak #${userStats.currentStreak}Days #ConsistencyWins`,
    
    achievementBoast: `🏆 LEVEL UP: ${userStats.trophiesEarned} achievements unlocked!\n\n💪 RecordRoulette stats:\n📀 ${userStats.totalSpins} albums discovered\n🔥 ${userStats.longestStreak} days longest streak\n\nDaily music discovery = personal growth 📈\n\nWhat's your current streak? Drop it below! 👇\n\n#RecordRoulette #AchievementUnlocked #MusicGoals`,
    
    simple: `🎵 ${userStats.totalSpins} albums discovered on RecordRoulette!\n\nCurrent ${userStats.currentStreak} day streak 🔥\n\nDaily music discovery hits different ✨`,
    
    tiktok: `🎰 POV: You've been using RecordRoulette for discovery\n\n📊 My stats:\n• ${userStats.totalSpins} albums found\n• ${userStats.currentStreak} day streak\n• ${userStats.trophiesEarned} achievements\n\nMusic taste: UPGRADED ✨\n\n#RecordRoulette #MusicTok #POV #MusicDiscovery #StatsReveal`,
    
    link: `${window.location.origin}?ref=profile&user=${encodeURIComponent(userProfile.displayName)}`
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      toast({
        title: "Copied!",
        description: `${label} text copied to clipboard`,
      });
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedText(label);
      toast({
        title: "Copied!",
        description: `${label} text copied to clipboard`,
      });
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const shareToSocial = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const text = shareTexts.stats;
    const url = shareTexts.link;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent('My RecordRoulette Stats')}&summary=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-card border-border shadow-2xl">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Share My Stats 📊</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>

              {/* Stats Preview */}
              <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{userStats.totalSpins}</div>
                    <div className="text-xs text-muted-foreground">Albums</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{userStats.currentStreak}</div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{userStats.longestStreak}</div>
                    <div className="text-xs text-muted-foreground">Best Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{userStats.trophiesEarned}</div>
                    <div className="text-xs text-muted-foreground">Trophies</div>
                  </div>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="mb-6">
                <div className="text-sm font-medium text-foreground mb-3">🚀 Share instantly:</div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => shareToSocial('twitter')}
                    size="sm"
                    variant="outline"
                    className="hover:bg-blue-400/10 border-blue-400/30"
                  >
                    <i className="fab fa-twitter text-blue-400 mr-2"></i>
                    Tweet
                  </Button>
                  
                  <Button
                    onClick={() => shareToSocial('facebook')}
                    size="sm"
                    variant="outline"
                    className="hover:bg-blue-600/10 border-blue-600/30"
                  >
                    <i className="fab fa-facebook text-blue-300 mr-2"></i>
                    Post
                  </Button>
                  
                  <Button
                    onClick={() => shareToSocial('linkedin')}
                    size="sm"
                    variant="outline"
                    className="hover:bg-blue-700/10 border-blue-700/30"
                  >
                    <i className="fab fa-linkedin text-blue-200 mr-2"></i>
                    Share
                  </Button>
                </div>
              </div>

              {/* Viral Copy Templates */}
              <div className="space-y-3 mb-6 border-t border-border pt-4">
                <div className="text-sm font-medium text-foreground mb-3">📱 Copy viral templates:</div>
                
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto p-4 border-pink-500/30 hover:bg-pink-500/10"
                  onClick={() => copyToClipboard(shareTexts.instagramStats, 'Instagram')}
                >
                  <div className="flex items-center">
                    <i className="fab fa-instagram text-pink-500 mr-3 text-lg"></i>
                    <div className="text-left">
                      <div className="font-medium">Instagram Year Review</div>
                      <div className="text-xs text-muted-foreground">📊 Stats showcase format</div>
                    </div>
                  </div>
                  {copiedText === 'Instagram' ? (
                    <i className="fas fa-check text-green-500"></i>
                  ) : (
                    <i className="fas fa-copy text-muted-foreground"></i>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-auto p-4 border-white/30 hover:bg-white/10"
                  onClick={() => copyToClipboard(shareTexts.tiktok, 'TikTok')}
                >
                  <div className="flex items-center">
                    <i className="fab fa-tiktok text-white mr-3 text-lg"></i>
                    <div className="text-left">
                      <div className="font-medium">TikTok POV Stats</div>
                      <div className="text-xs text-muted-foreground">🎵 POV reveal format</div>
                    </div>
                  </div>
                  {copiedText === 'TikTok' ? (
                    <i className="fas fa-check text-green-500"></i>
                  ) : (
                    <i className="fas fa-copy text-muted-foreground"></i>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-auto p-4 border-yellow-500/30 hover:bg-yellow-500/10"
                  onClick={() => copyToClipboard(shareTexts.streakPost, 'Streak')}
                >
                  <div className="flex items-center">
                    <i className="fas fa-fire text-yellow-500 mr-3 text-lg"></i>
                    <div className="text-left">
                      <div className="font-medium">Streak Flex Post</div>
                      <div className="text-xs text-muted-foreground">🔥 Show off your consistency</div>
                    </div>
                  </div>
                  {copiedText === 'Streak' ? (
                    <i className="fas fa-check text-green-500"></i>
                  ) : (
                    <i className="fas fa-copy text-muted-foreground"></i>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-auto p-4 border-purple-500/30 hover:bg-purple-500/10"
                  onClick={() => copyToClipboard(shareTexts.challenge, 'Challenge')}
                >
                  <div className="flex items-center">
                    <i className="fas fa-users text-purple-400 mr-3 text-lg"></i>
                    <div className="text-left">
                      <div className="font-medium">Friend Challenge</div>
                      <div className="text-xs text-muted-foreground">🎯 Invite friends to join</div>
                    </div>
                  </div>
                  {copiedText === 'Challenge' ? (
                    <i className="fas fa-check text-green-500"></i>
                  ) : (
                    <i className="fas fa-copy text-muted-foreground"></i>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-auto p-4"
                  onClick={() => copyToClipboard(shareTexts.simple, 'Simple')}
                >
                  <div className="flex items-center">
                    <i className="fas fa-comment-dots text-gray-400 mr-3 text-lg"></i>
                    <div className="text-left">
                      <div className="font-medium">Simple Stats</div>
                      <div className="text-xs text-muted-foreground">Clean & minimal</div>
                    </div>
                  </div>
                  {copiedText === 'Simple' ? (
                    <i className="fas fa-check text-green-500"></i>
                  ) : (
                    <i className="fas fa-copy text-muted-foreground"></i>
                  )}
                </Button>
              </div>

              {/* Link Sharing */}
              <div className="border-t border-border pt-4">
                <Button
                  onClick={() => copyToClipboard(shareTexts.link, 'Profile Link')}
                  variant="outline"
                  className="w-full hover:bg-accent/10"
                >
                  <i className="fas fa-link mr-2"></i>
                  {copiedText === 'Profile Link' ? 'Link Copied!' : 'Copy Profile Link'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Share your RecordRoulette journey
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}