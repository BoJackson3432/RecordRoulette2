import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import AlbumCard from "@/components/AlbumCard";
import ShareModal from "@/components/ShareModal";
import AchievementNotification from "@/components/AchievementNotification";
import { Button } from "@/components/ui/button";
import { api, type SpinDetails } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function SpinReveal() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const [newTrophies, setNewTrophies] = useState<any[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Extract spin ID from URL
  const spinId = location.split("/").pop();

  // Get spin details
  const { data: spin, isLoading, error } = useQuery<SpinDetails>({
    queryKey: ["/api/spins", spinId],
    enabled: !!spinId,
  });

  // Mark as listened mutation
  const listenMutation = useMutation({
    mutationFn: () => api.markListened(spinId!),
    onSuccess: (data) => {
      // Check if we earned new trophies/achievements
      if (data.newTrophies && data.newTrophies.length > 0) {
        setNewTrophies(data.newTrophies);
        setShowAchievements(true);
        
        // Also show a toast for each achievement
        data.newTrophies.forEach((trophy: any, index: number) => {
          setTimeout(() => {
            toast({
              title: "🏆 Achievement Unlocked!",
              description: trophy.name,
              duration: 3000,
            });
          }, index * 1000);
        });
      } else {
        toast({
          title: "Album Marked as Listened!",
          description: `Current streak: ${data.streak.current} days`,
        });
      }
      
      // Invalidate profile to update streak and spins history
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/spins"] });
      
      // Update the current spin data
      queryClient.setQueryData(["/api/spins", spinId], (oldData: any) => ({
        ...oldData,
        listenedAt: new Date().toISOString(),
      }));
    },
    onError: (error: any) => {
      toast({
        title: "Couldn't Save Your Progress",
        description: error.message || "We couldn't mark this album as listened. Please try again!",
        variant: "destructive",
      });
    },
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: () => api.generateShareImage(spinId!),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recordroulette-${spin?.album.name || 'album'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Share Image Downloaded!",
        description: "Perfect for Instagram Stories!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Couldn't Create Share Image",
        description: error.message || "We couldn't generate your share image. Please try again!",
        variant: "destructive",
      });
    },
  });

  // Favorite status query
  const { data: favoriteStatus } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/favorites/${spin?.album.id}/status`],
    enabled: !!spin?.album.id,
  });

  const isFavorite = favoriteStatus?.isFavorite || false;

  // Add to favorites mutation
  const addToFavorites = useMutation({
    mutationFn: () => fetch(`/api/favorites/${spin!.album.id}`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${spin!.album.id}/status`] });
      toast({
        title: "Added to Favourites",
        description: `${spin!.album.name} has been added to your favourites.`,
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: "Failed to Add",
        description: "Could not add album to favourites. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  // Remove from favorites mutation
  const removeFromFavorites = useMutation({
    mutationFn: () => fetch(`/api/favorites/${spin!.album.id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${spin!.album.id}/status`] });
      toast({
        title: "Removed from Favourites", 
        description: `${spin!.album.name} has been removed from your favourites.`,
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: "Failed to Remove",
        description: "Could not remove album from favourites. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  // Play album mutation
  const playMutation = useMutation({
    mutationFn: () => api.playAlbum(spin!.album.id),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "🎵 Playing on Spotify",
          description: "Album started from track 1 - no shuffle, just like vinyl!",
        });
      } else if (data.requiresDevice && data.spotifyUrl) {
        // Show a helpful message and automatically open Spotify as fallback
        toast({
          title: "No Active Device Found",
          description: "Opening album in Spotify. Please start Spotify on a device first, then try the play button again.",
          variant: "destructive",
        });
        // Auto-open Spotify as fallback
        setTimeout(() => {
          window.open(data.spotifyUrl, "_blank", "noopener,noreferrer");
        }, 1000);
      } else {
        toast({
          title: "Couldn't Start Playback",
          description: data.message || "We couldn't start playing this album",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Couldn't Play Album",
        description: error.message || "Make sure Spotify is open on a device and you have Spotify Premium.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!spinId) {
      navigate("/");
    }
  }, [spinId, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input and no modals are open
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't handle shortcuts if modal is open
      if (showShareModal) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'enter': 
        case ' ': // Enter or Spacebar to mark as listened
          e.preventDefault();
          if (spin && !spin.listenedAt && !listenMutation.isPending) {
            handleMarkListened();
          }
          break;
        case 'p': // P to play album
          e.preventDefault();
          if (spin && !playMutation.isPending) {
            handlePlaySpotify();
          }
          break;
        case 's': // S to share
          e.preventDefault();
          if (spin) {
            handleShare();
          }
          break;
        case 'h': // H to go home
          e.preventDefault();
          handleSpinAnother();
          break;
        case 'd': // D to download share image
          e.preventDefault();
          if (spin && !shareMutation.isPending) {
            handleDownloadImage();
          }
          break;
        case 'o': // O to open in Spotify
          e.preventDefault();
          if (spin) {
            handleOpenSpotify();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [spin, showShareModal, listenMutation.isPending, playMutation.isPending, shareMutation.isPending]);


  const handlePlaySpotify = () => {
    if (spin) {
      playMutation.mutate();
    }
  };

  const handleOpenSpotify = () => {
    if (spin?.album.deepLink) {
      window.open(spin.album.deepLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleMarkListened = () => {
    if (!spin?.listenedAt) {
      listenMutation.mutate();
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleDownloadImage = () => {
    shareMutation.mutate();
  };

  const handleSpinAnother = () => {
    navigate("/");
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites.mutate();
    } else {
      addToFavorites.mutate();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ': // Space bar to favorite
        case 'f': // F key to favorite
          if (spin) {
            event.preventDefault();
            handleToggleFavorite();
          }
          break;
        case 'l': // L key to mark as listened
          if (spin && !spin.listenedAt) {
            event.preventDefault();
            handleMarkListened();
          }
          break;
        case 'p': // P key to play
          if (spin) {
            event.preventDefault();
            handlePlaySpotify();
          }
          break;
        case 's': // S key to share
          if (spin) {
            event.preventDefault();
            handleShare();
          }
          break;
        case 'escape': // Escape to close share modal
          if (showShareModal) {
            event.preventDefault();
            setShowShareModal(false);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [spin, showShareModal]);

  if (isLoading) {
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
          <p className="text-muted-foreground">Loading your spin...</p>
        </div>
      </div>
    );
  }

  if (error || !spin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-destructive text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Spin Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The spin you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/")} data-testid="button-back-home">
            <i className="fas fa-home mr-2"></i>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20" data-testid="spin-reveal">
      <div className="max-w-4xl mx-auto text-center">
        {/* Reveal Animation */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Your Album Awaits!
          </h2>
          <p className="text-muted-foreground text-lg">
            Time to dive deep into a full listening experience
          </p>
          <div className="text-xs text-muted-foreground/50 mt-3">
            Keyboard shortcuts: <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">F</kbd> to favorite, 
            <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs ml-1">L</kbd> to listen, 
            <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs ml-1">P</kbd> to play
          </div>
        </motion.div>

        {/* Album Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <AlbumCard
            album={spin.album}
            onPlaySpotify={handlePlaySpotify}
            onMarkListened={handleMarkListened}
            onShare={handleShare}
            onToggleFavorite={handleToggleFavorite}
            isListened={!!spin.listenedAt}
            isLoading={listenMutation.isPending || shareMutation.isPending}
            isPlayLoading={playMutation.isPending}
            isFavorite={isFavorite}
            isFavoriteLoading={addToFavorites.isPending || removeFromFavorites.isPending}
          />
        </motion.div>

        {/* Spin Another Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button
            onClick={handleSpinAnother}
            variant="outline"
            className="mt-8 bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            data-testid="button-spin-another"
          >
            Spin Another Album
          </Button>
        </motion.div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        album={{
          name: spin.album.name,
          artist: spin.album.artist,
          coverUrl: spin.album.coverUrl || undefined
        }}
        onDownloadImage={handleDownloadImage}
        isGeneratingImage={shareMutation.isPending}
      />

      {/* Achievement Notifications */}
      {showAchievements && newTrophies.length > 0 && (
        <AchievementNotification
          newTrophies={newTrophies}
          onClose={() => {
            setShowAchievements(false);
            setNewTrophies([]);
          }}
          userStats={{
            totalSpins: spin.totalSpins || 0,
            currentStreak: spin.currentStreak || 0,
            longestStreak: spin.longestStreak || 0,
            listenedSpins: spin.listenedSpins || 0,
          }}
        />
      )}
    </div>
  );
}
