import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: {
    name: string;
    artist: string;
    coverUrl?: string;
  };
  onDownloadImage: () => void;
  isGeneratingImage?: boolean;
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  album, 
  onDownloadImage,
  isGeneratingImage = false 
}: ShareModalProps) {
  const { toast } = useToast();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Generate viral-optimized share texts for different platforms
  const shareTexts = {
    instagram: `🎰 SPIN RESULT 🎰\n\n"${album.name}"\nby ${album.artist}\n\n✨ Discovered on RecordRoulette\n🔥 This one hits different\n\nWho else needs a daily music discovery app?\n\n#RecordRoulette #MusicRoulette #VinylVibes #NewMusicFriday #MusicDiscovery #SpotifyFinds`,
    
    instagramStory: `🎵 Today's spin: "${album.name}" by ${album.artist}\n\n🎰 Try RecordRoulette - it's like having the world's best record collection\n\nLink in bio 👆`,
    
    twitter: `🎰 Spun the roulette: "${album.name}" by ${album.artist}\n\nDaily album discoveries > endless scrolling through playlists\n\n#RecordRoulette #MusicDiscovery`,
    
    tiktok: `🎰 POV: Your music taste just upgraded\n\n"${album.name}" - ${album.artist}\n\n✨ Found on @RecordRoulette\n🎵 Full album experience\n💿 Daily discoveries\n\n#RecordRoulette #MusicTok #NewMusic #VinylTok #MusicDiscovery #SpotifyFinds`,
    
    facebook: `🎵 Just discovered "${album.name}" by ${album.artist} through RecordRoulette!\n\nIt's like having a personal DJ who only plays full albums. Perfect for when you want to dive deep into music instead of just hitting shuffle.\n\nAnyone else missing the days of listening to complete albums? This app brings that back! 🎶`,
    
    challenge: `🎰 CHALLENGE: Use RecordRoulette for 7 days\n\nDay 1: "${album.name}" by ${album.artist}\n\nWho's joining me? Drop your spin results below! 👇\n\n#RecordRouletteChallenge #7DayMusicChallenge`,
    
    general: `🎵 "${album.name}" by ${album.artist}\n\nDiscovered through RecordRoulette - daily album discoveries that bring back the art of full album listening 🎰✨`,
    
    minimal: `"${album.name}" - ${album.artist}\n\nFound on RecordRoulette 🎰`,
    
    link: `${window.location.origin}?ref=social&album=${encodeURIComponent(album.name)}&artist=${encodeURIComponent(album.artist)}`
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
      // Fallback for older browsers
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

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${album.name} by ${album.artist}`,
          text: shareTexts.general,
          url: window.location.origin,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback to copying general text
      copyToClipboard(shareTexts.general, 'Share');
    }
  };

  const shareToTwitter = () => {
    const tweetText = encodeURIComponent(shareTexts.twitter);
    const shareUrl = encodeURIComponent(shareTexts.link);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${shareUrl}`, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const shareUrl = encodeURIComponent(shareTexts.link);
    const quote = encodeURIComponent(shareTexts.facebook);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${quote}`, '_blank', 'width=550,height=420');
  };

  const shareToLinkedIn = () => {
    const title = encodeURIComponent(`${album.name} by ${album.artist} - RecordRoulette Discovery`);
    const summary = encodeURIComponent(shareTexts.general);
    const shareUrl = encodeURIComponent(shareTexts.link);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${title}&summary=${summary}`, '_blank');
  };

  const shareToReddit = () => {
    const title = encodeURIComponent(`🎵 Just discovered "${album.name}" by ${album.artist} on RecordRoulette!`);
    const shareUrl = encodeURIComponent(shareTexts.link);
    window.open(`https://reddit.com/submit?title=${title}&url=${shareUrl}`, '_blank');
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
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-card border-border shadow-2xl">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Share My Spin</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>

              {/* Album Info */}
              <div className="flex items-center space-x-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={album.coverUrl || "/api/placeholder/64/64"}
                    alt={`${album.name} cover`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">{album.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{album.artist}</div>
                </div>
              </div>

              {/* Native Share (Mobile) */}
              {'share' in navigator && (
                <Button
                  onClick={shareNative}
                  className="w-full mb-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <i className="fas fa-share mr-2"></i>
                  Share
                </Button>
              )}

              {/* One-Tap Social Sharing */}
              <div className="mb-6">
                <div className="text-sm font-medium text-foreground mb-3">🚀 One-tap social sharing:</div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToTwitter}
                    className="flex items-center justify-center gap-2 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400"
                    data-testid="button-share-twitter"
                  >
                    <i className="fab fa-twitter text-blue-400"></i>
                    Post Tweet
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToFacebook}
                    className="flex items-center justify-center gap-2 hover:bg-blue-600/10 hover:border-blue-600/30 hover:text-blue-300"
                    data-testid="button-share-facebook"
                  >
                    <i className="fab fa-facebook text-blue-300"></i>
                    Share Post
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToLinkedIn}
                    className="flex items-center justify-center gap-2 hover:bg-blue-700/10 hover:border-blue-700/30 hover:text-blue-200"
                    data-testid="button-share-linkedin"
                  >
                    <i className="fab fa-linkedin text-blue-200"></i>
                    Share Post
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToReddit}
                    className="flex items-center justify-center gap-2 hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-400"
                    data-testid="button-share-reddit"
                  >
                    <i className="fab fa-reddit text-orange-400"></i>
                    Submit Post
                  </Button>
                </div>

                {/* Enhanced Link Sharing */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(shareTexts.link, 'Link')}
                    className="hover:bg-accent/10 hover:border-accent/30 hover:text-accent"
                    data-testid="button-copy-link"
                  >
                    <i className="fas fa-link mr-2"></i>
                    {copiedText === 'Link' ? 'Copied!' : 'Copy Link'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const whatsappText = encodeURIComponent(`🎰 Check out this album I discovered: "${album.name}" by ${album.artist}\n\n${shareTexts.link}`);
                      window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
                    }}
                    className="hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400"
                    data-testid="button-share-whatsapp"
                  >
                    <i className="fab fa-whatsapp text-green-400 mr-2"></i>
                    WhatsApp
                  </Button>
                </div>
              </div>

              {/* Viral Copy Options */}
              <div className="space-y-3 mb-6 border-t border-border pt-4">
                <div className="text-sm font-medium text-foreground mb-3">🔥 Copy viral text for:</div>
                
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto p-4 border-pink-500/30 hover:bg-pink-500/10"
                  onClick={() => copyToClipboard(shareTexts.instagram, 'Instagram')}
                >
                  <div className="flex items-center">
                    <i className="fab fa-instagram text-pink-500 mr-3 text-lg"></i>
                    <div className="text-left">
                      <div className="font-medium">Instagram Posts</div>
                      <div className="text-xs text-muted-foreground">🎰 Viral-optimized with trending hashtags</div>
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
                  className="w-full justify-between h-auto p-4 border-pink-500/30 hover:bg-pink-500/10"
                  onClick={() => copyToClipboard(shareTexts.instagramStory, 'Instagram Stories')}
                >
                  <div className="flex items-center">
                    <i className="fab fa-instagram text-pink-500 mr-3 text-lg"></i>
                    <div className="text-left">
                      <div className="font-medium">Instagram Stories</div>
                      <div className="text-xs text-muted-foreground">📱 Perfect for Stories format</div>
                    </div>
                  </div>
                  {copiedText === 'Instagram Stories' ? (
                    <i className="fas fa-check text-green-500"></i>
                  ) : (
                    <i className="fas fa-copy text-muted-foreground"></i>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-auto p-4"
                  onClick={() => copyToClipboard(shareTexts.twitter, 'Twitter')}
                >
                  <div className="flex items-center">
                    <i className="fab fa-twitter text-blue-400 mr-3 text-lg"></i>
                    <div className="text-left">
                      <div className="font-medium">Twitter / X</div>
                      <div className="text-xs text-muted-foreground">Optimized for social</div>
                    </div>
                  </div>
                  {copiedText === 'Twitter' ? (
                    <i className="fas fa-check text-green-500"></i>
                  ) : (
                    <i className="fas fa-copy text-muted-foreground"></i>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-auto p-4 border-white/30 hover:bg-white/10"
                  onClick={() => copyToClipboard(shareTexts.tiktok, 'TikTok')}
                  data-testid="button-copy-tiktok"
                >
                  <div className="flex items-center">
                    <i className="fab fa-tiktok text-white mr-3 text-lg"></i>
                    <div className="text-left">
                      <div className="font-medium">TikTok / Reels</div>
                      <div className="text-xs text-muted-foreground">🎵 "POV" format for max engagement</div>
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
                  className="w-full justify-between h-auto p-4 border-purple-500/30 hover:bg-purple-500/10"
                  onClick={() => copyToClipboard(shareTexts.challenge, 'Challenge')}
                  data-testid="button-copy-challenge"
                >
                  <div className="flex items-center">
                    <i className="fas fa-trophy text-purple-400 mr-3 text-lg"></i>
                    <div className="text-left">
                      <div className="font-medium">7-Day Challenge</div>
                      <div className="text-xs text-muted-foreground">🏆 Start a viral challenge</div>
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
                  onClick={() => copyToClipboard(shareTexts.minimal, 'Simple')}
                  data-testid="button-copy-simple"
                >
                  <div className="flex items-center">
                    <i className="fas fa-comment-dots text-gray-400 mr-3 text-lg"></i>
                    <div className="text-left">
                      <div className="font-medium">Simple Message</div>
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

              {/* Download Image */}
              <div className="border-t border-border pt-4">
                <Button
                  onClick={onDownloadImage}
                  disabled={isGeneratingImage}
                  variant="outline"
                  className="w-full"
                >
                  {isGeneratingImage ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Generating Image...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download mr-2"></i>
                      Download Share Image
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Perfect for Instagram Stories (1080×1920)
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}