import { useState, useEffect } from "react";
import OnboardingModal from "@/components/OnboardingModal";
import StreakCelebration from "@/components/StreakCelebration";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import VinylSpinner from "@/components/VinylSpinner";
import StreakBadge from "@/components/StreakBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, type UserProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useSpinStatus } from "@/hooks/useSpinStatus";
import { Clock, Calendar, Heart } from "lucide-react";

const DISCOVERY_MODES = [
  { id: "saved", name: "From My Music", description: "Albums from your liked songs", icon: "❤️" },
  { id: "recommendations", name: "For You", description: "Personalized recommendations based on your taste", icon: "✨" },
  { id: "discovery", name: "New Artists", description: "Fresh artists you haven't discovered yet", icon: "🎭" },
  { id: "roulette", name: "Russian Roulette", description: "Completely random popular albums across all genres", icon: "🎰" }
];

export default function Landing() {
  const [, navigate] = useLocation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedMode, setSelectedMode] = useState("saved");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user profile - only if not already cached
  const { data: profile, isLoading: isProfileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/me"],
    queryFn: async () => {
      const response = await fetch("/api/me", { credentials: "include" });
      if (response.status === 401) return null;
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
    enabled: true, // Always try once
    retry: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 10 * 60 * 1000,
  });

  // Temporarily disable spin status to stop API polling
  const canSpin = true;
  const timeRemainingFormatted = "";
  const nextSpinAvailable = null;
  const message = "";
  const refetch = () => {};

  // Check if user needs onboarding
  useEffect(() => {
    if (profile && !profile.onboardingCompleted && !showOnboarding) {
      setShowOnboarding(true);
    }
  }, [profile, showOnboarding]);

  // Spin mutation
  const spinMutation = useMutation({
    mutationFn: (mode: string) => api.createSpin(mode),
    onMutate: () => {
      setIsSpinning(true);
    },
    onSuccess: (data) => {
      // Invalidate queries to update stats in real-time
      queryClient.invalidateQueries({ queryKey: ["/api/spin/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/spins"] });
      
      // Wait for animation to complete before navigating
      setTimeout(() => {
        navigate(`/spin/${data.spinId}`);
      }, 2200);
      
      // Check for streak milestones after spin success
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/me"] }).then(() => {
          // Re-fetch profile to get updated streak
          const updatedProfile = queryClient.getQueryData<UserProfile>(["/api/me"]);
          if (updatedProfile?.streak?.current) {
            const currentStreak = updatedProfile.streak.current;
            const isMilestone = currentStreak === 3 || currentStreak === 7 || currentStreak === 14 || currentStreak === 30;
            if (isMilestone) {
              setCelebrationStreak(currentStreak);
              setShowStreakCelebration(true);
            }
          }
        });
      }, 3000);
    },
    onError: (error: any) => {
      setIsSpinning(false);
      if (error.message && error.message.includes("Daily limit reached")) {
        toast({
          title: "Daily Limit Reached",
          description: "Come back tomorrow for your next spin!",
          variant: "default",
        });
        refetch(); // Update spin status
      } else {
        toast({
          title: "Couldn't Start Your Spin", 
          description: error.message || "Something went wrong while finding your album. Please try again!",
          variant: "destructive",
        });
      }
    },
  });

  const playGunshotSound = () => {
    try {
      // Simple click sound for better performance
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Could not play gunshot sound:', error);
    }
  };

  const playNeedledropSound = () => {
    try {
      // Simple whoosh sound for better performance
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1.0);
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + 1.0);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1.0);
    } catch (error) {
      console.log('Could not play vinyl rewind sound:', error);
    }
  };

  const handleSpin = () => {
    if (spinMutation.isPending || isSpinning) return;
    
    // If user is not logged in, redirect to Spotify login
    if (!profile) {
      window.location.href = api.getSpotifyLoginUrl();
      return;
    }

    // Check if user can spin
    if (!canSpin) {
      toast({
        title: "Daily Limit Reached",
        description: `You can spin again in ${timeRemainingFormatted}`,
        variant: "destructive",
      });
      return;
    }
    
    // Play dramatic gunshot sound for ALL modes for consistent experience
    playGunshotSound();
    
    spinMutation.mutate(selectedMode);
  };

  const handleSpinComplete = () => {
    // Animation completed, navigation handled in onSuccess
  };

  // Keyboard shortcuts (after handleSpin is defined)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't handle shortcuts if modals are open
      if (showOnboarding) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ': // Spacebar to spin
          e.preventDefault();
          if (canSpin && !isSpinning && !spinMutation.isPending) {
            handleSpin();
          }
          break;
        case 'r': // R to refresh/reload
          e.preventDefault();
          if (!isSpinning && !spinMutation.isPending) {
            refetch();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [canSpin, isSpinning, spinMutation.isPending, showOnboarding, refetch]);

  if (isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-8 animate-spin">
            <div className="w-full h-full rounded-full border-4 border-primary relative" style={{
              background: "radial-gradient(circle, #1a1a1a 20%, #0a0a0a 40%, #1a1a1a 60%, #0a0a0a 80%)"
            }}>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-accent rounded-full"></div>
            </div>
          </div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-10 transform rotate-45" 
             style={{ background: "radial-gradient(circle, #1a1a1a 20%, #0a0a0a 40%, #1a1a1a 60%, #0a0a0a 80%)" }}></div>
        <div className="absolute bottom-20 right-16 w-48 h-48 rounded-full opacity-5 transform -rotate-12"
             style={{ background: "radial-gradient(circle, #1a1a1a 20%, #0a0a0a 40%, #1a1a1a 60%, #0a0a0a 80%)" }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full opacity-8"
             style={{ background: "radial-gradient(circle, #1a1a1a 20%, #0a0a0a 40%, #1a1a1a 60%, #0a0a0a 80%)" }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center" data-testid="landing-content">
        {/* Title */}
        <motion.div 
          className="mb-12 mt-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-6 h-6 bg-primary rounded-full mr-3"></div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold vinyl-text-gradient pb-2">
              Rhythm and Chance
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Rediscover your music library one spin at a time. Build streaks, explore forgotten albums, and fall in love with full-album listening again.
          </p>
        </motion.div>

        {/* Discovery Mode Selector */}
        {profile && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-foreground mb-4">Choose Your Discovery Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {DISCOVERY_MODES.map((mode) => (
                <Card
                  key={mode.id}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    selectedMode === mode.id
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                  onClick={() => setSelectedMode(mode.id)}
                  data-testid={`mode-${mode.id}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{mode.icon}</div>
                    <div className="font-semibold text-foreground mb-1">{mode.name}</div>
                    <div className="text-xs text-muted-foreground">{mode.description}</div>
                    {selectedMode === mode.id && (
                      <Badge className="mt-2 bg-primary text-primary-foreground">Selected</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Vinyl Roulette Wheel */}
        <motion.div 
          className="relative mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <VinylSpinner 
            isSpinning={isSpinning}
            onSpinComplete={handleSpinComplete}
            disabled={spinMutation.isPending || !canSpin}
            selectedMode={selectedMode}
          />

          {/* Spin Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Spin Button / Countdown */}
            {profile && !canSpin ? (
              <div className="mt-8 text-center">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-6 mx-auto max-w-sm">
                  <div className="text-sm text-white/70 mb-2">Next spin available in</div>
                  <div className="text-3xl font-mono font-light text-white tracking-wider">
                    {timeRemainingFormatted}
                  </div>
                  <div className="text-xs text-white/50 mt-2">One album per day</div>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleSpin}
                disabled={isSpinning || spinMutation.isPending || !canSpin}
                className="mt-8 bg-white text-black hover:bg-white/90 font-medium py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl flex items-center space-x-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
                data-testid="button-spin"
              >
                <span>
                  {profile 
                    ? `Spin ${DISCOVERY_MODES.find(m => m.id === selectedMode)?.name || "Album"}` 
                    : "Login with Spotify to Spin"}
                </span>
              </Button>
            )}
          </motion.div>
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {profile ? (
              <motion.div
                key="authenticated"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
              >
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary" data-testid="stat-total-spins">
                      0
                    </div>
                    <div className="text-sm text-muted-foreground">Albums Spun</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-accent" data-testid="stat-current-streak">
                      {profile.streak.current}
                    </div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary" data-testid="stat-longest-streak">
                      {profile.streak.longest}
                    </div>
                    <div className="text-sm text-muted-foreground">Best Streak</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-accent" data-testid="stat-hours-listened">
                      0
                    </div>
                    <div className="text-sm text-muted-foreground">Hours Listened</div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="unauthenticated"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center max-w-md mx-auto"
              >
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fab fa-spotify text-primary text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Connect Your Spotify
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Sign in with Spotify to start discovering albums from your personal library
                    </p>
                    <Button
                      onClick={() => window.location.href = api.getSpotifyLoginUrl()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      data-testid="button-login-spotify"
                    >
                      <i className="fab fa-spotify mr-2"></i>
                      Connect Spotify
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      
      {/* Streak Celebration */}
      <StreakCelebration
        isOpen={showStreakCelebration}
        streak={celebrationStreak}
        onClose={() => setShowStreakCelebration(false)}
      />
    </div>
  );
}
