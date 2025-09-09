import { useState, useEffect, useRef, useMemo, useContext, createContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, type UserProfile } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VinylRecordProps {
  album: any;
  index: number;
}

// Context for batch favorite status
const FavoriteStatusContext = createContext<{
  favoriteStatuses: Record<string, boolean>;
  updateFavoriteStatus: (albumId: string, isFavorite: boolean) => void;
}>({
  favoriteStatuses: {},
  updateFavoriteStatus: () => {},
});

function FavoriteButton({ albumId, albumName }: { albumId: string; albumName?: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { favoriteStatuses, updateFavoriteStatus } = useContext(FavoriteStatusContext);

  const isFavorite = favoriteStatuses[albumId] || false;

  // Add to favorites mutation
  const addToFavorites = useMutation({
    mutationFn: () => fetch(`/api/favorites/${albumId}`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      updateFavoriteStatus(albumId, true);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to Favourites",
        description: `${albumName || "Album"} has been added to your favourites.`,
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
    mutationFn: () => fetch(`/api/favorites/${albumId}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => {
      updateFavoriteStatus(albumId, false);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from Favourites",
        description: `${albumName || "Album"} has been removed from your favourites.`,
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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (isFavorite) {
      removeFromFavorites.mutate();
    } else {
      addToFavorites.mutate();
    }
  };

  const isLoading = addToFavorites.isPending || removeFromFavorites.isPending;

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      variant="ghost"
      size="sm"
      className={`absolute top-2 right-2 h-9 w-9 sm:h-8 sm:w-8 p-0 rounded-full backdrop-blur-sm transition-all duration-200 z-10 touch-manipulation ${
        isFavorite 
          ? "bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 border border-red-500/50" 
          : "bg-black/20 hover:bg-black/40 active:bg-black/50 border border-white/20 hover:border-white/40"
      }`}
      data-testid={`button-favorite-${albumId}`}
      aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favourites`}
    >
      {isLoading ? (
        <motion.div
          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <motion.i
          className={`fas fa-heart transition-colors duration-200 ${
            isFavorite ? "text-red-500" : "text-white/60 hover:text-red-400"
          }`}
          animate={isFavorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: "backOut" }}
        />
      )}
    </Button>
  );
}

function VinylRecord({ album, index }: VinylRecordProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);
  const scale = useTransform(mouseX, [-100, 100], [0.9, 1.1]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const offsetX = e.clientX - centerX;
    const offsetY = e.clientY - centerY;
    
    mouseX.set(offsetX / 2);
    mouseY.set(offsetY / 2);
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className="group relative"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      style={{
        perspective: "1000px",
      }}
    >
      <motion.div
        className="relative"
        style={{
          rotateX,
          rotateY,
          scale,
        }}
        whileHover={{ z: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Vinyl Record */}
        <div className="relative w-64 h-64 mx-auto">
          {/* Main vinyl disc */}
          <motion.div
            className="w-full h-full rounded-full border-4 shadow-2xl relative overflow-hidden"
            style={{ 
              borderColor: "#10b981",
              background: "radial-gradient(circle, #2a2a2a 0%, #1a1a1a 30%, #0f0f0f 60%, #0a0a0a 100%)"
            }}
            animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 4, ease: "linear", repeat: isHovered ? Infinity : 0 }}
          >
            {/* Album cover in center */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl">
              {album.coverUrl ? (
                <img 
                  src={album.coverUrl} 
                  alt={album.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center ${album.coverUrl ? 'hidden' : ''}`}>
                <i className="fas fa-music text-white text-2xl drop-shadow-lg"></i>
              </div>
            </div>
            
            {/* Detailed grooves */}
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-gray-600"
                style={{
                  inset: `${8 + i * 6}px`,
                  opacity: 0.1 + (i * 0.02),
                }}
              />
            ))}
            
            {/* Spindle hole */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full z-30"></div>
          </motion.div>
          
          {/* Glare effect */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                  transform: "rotate(45deg)",
                }}
              />
            )}
          </AnimatePresence>
        </div>
        
        {/* Favorite button */}
        <FavoriteButton albumId={album.id} albumName={album.name} />
        
        {/* Album info card */}
        <motion.div
          className="mt-6 text-center bg-card/30 backdrop-blur-sm rounded-xl p-4 border border-white/10"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="font-bold text-foreground text-lg mb-2 truncate">
            {album.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 truncate">
            {album.artist}
          </p>
          {album.year && (
            <p className="text-xs text-muted-foreground/70 mb-2">
              {album.year}
            </p>
          )}
          {album.genres && album.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {album.genres.slice(0, 2).map((genre: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function Collection() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, alphabetical, artist, decade
  const [favoriteStatuses, setFavoriteStatuses] = useState<Record<string, boolean>>({});
  
  // Get user profile
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/me"],
    retry: false,
  });

  // Get spin history
  const { data: spinHistory, isLoading: isLoadingSpins } = useQuery<any[]>({
    queryKey: ["/api/spins/history"],
    enabled: !!profile,
  });

  // Get favorites
  const { data: favorites, isLoading: isLoadingFavorites } = useQuery<any[]>({
    queryKey: ["/api/favorites"],
    enabled: !!profile,
  });

  // Batch load favorite statuses
  const albumIds = useMemo(() => {
    if (!spinHistory) return [];
    return spinHistory.map((spin: any) => spin.album.id);
  }, [spinHistory]);

  const { data: batchFavoriteStatuses } = useQuery({
    queryKey: ["/api/favorites/batch-status", albumIds],
    queryFn: () => fetch("/api/favorites/batch-status", {
      method: "POST",
      body: JSON.stringify({ albumIds }),
      headers: { "Content-Type": "application/json" },
    }).then(r => r.json()),
    enabled: !!profile && albumIds.length > 0,
  });

  // Update local favorite statuses when batch data loads
  useEffect(() => {
    if (batchFavoriteStatuses) {
      setFavoriteStatuses(batchFavoriteStatuses);
    }
  }, [batchFavoriteStatuses]);

  const updateFavoriteStatus = (albumId: string, isFavorite: boolean) => {
    setFavoriteStatuses(prev => ({ ...prev, [albumId]: isFavorite }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'f':
          event.preventDefault();
          setSelectedFilter(prev => prev === "favorites" ? "all" : "favorites");
          break;
        case 's':
          event.preventDefault();
          const sortOptions = ["recent", "alphabetical", "artist", "decade"];
          const currentIndex = sortOptions.indexOf(sortBy);
          const nextIndex = (currentIndex + 1) % sortOptions.length;
          setSortBy(sortOptions[nextIndex]);
          break;
        case '/':
          event.preventDefault();
          // Focus search input
          const searchInput = document.querySelector('[data-testid="input-search-collection"]') as HTMLInputElement;
          searchInput?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [sortBy]);

  const isLoading = isLoadingSpins || isLoadingFavorites;

  // Filter and sort albums
  const filteredAndSortedAlbums = useMemo(() => {
    let sourceData: any[] = [];
    
    // Choose data source based on filter
    if (selectedFilter === "favorites") {
      if (!favorites) return [];
      sourceData = favorites.map((fav: any) => ({ ...fav, album: fav.album }));
    } else {
      if (!spinHistory) return [];
      sourceData = spinHistory;
    }

    let filtered = sourceData;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item: any) => {
        const albumName = item.album?.name?.toLowerCase() || "";
        const artistName = item.album?.artist?.toLowerCase() || "";
        const genres = Array.isArray(item.album?.genres) 
          ? item.album.genres.join(" ").toLowerCase() 
          : "";
        
        return albumName.includes(query) || 
               artistName.includes(query) || 
               genres.includes(query);
      });
    }

    // Apply sorting
    const sortedFiltered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return (a.album?.name || "").localeCompare(b.album?.name || "");
        case "artist":
          return (a.album?.artist || "").localeCompare(b.album?.artist || "");
        case "decade":
          const yearA = a.album?.year || 0;
          const yearB = b.album?.year || 0;
          return yearB - yearA; // Newest first
        case "recent":
        default:
          const dateA = new Date(selectedFilter === "favorites" ? a.createdAt : a.startedAt);
          const dateB = new Date(selectedFilter === "favorites" ? b.createdAt : b.startedAt);
          return dateB.getTime() - dateA.getTime(); // Most recent first
      }
    });

    return sortedFiltered;
  }, [spinHistory, favorites, selectedFilter, searchQuery, sortBy]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to view your vinyl collection
          </p>
          <Button 
            onClick={() => window.location.href = "/auth/spotify/login"}
            className="bg-primary hover:bg-primary/90"
          >
            Login with Spotify
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              background: "radial-gradient(circle, #1a1a1a 20%, #0a0a0a 40%, #1a1a1a 60%, #0a0a0a 80%)"
            }}
          />
          <p className="text-muted-foreground">Loading your collection...</p>
        </div>
      </div>
    );
  }

  return (
    <FavoriteStatusContext.Provider value={{ favoriteStatuses, updateFavoriteStatus }}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Your Vinyl Collection
            </h1>
            <div className="w-2 h-2 bg-accent rounded-full ml-3"></div>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            Your personal music discovery journey, beautifully preserved. Each record tells the story of a moment when you discovered something amazing.
          </p>
          <div className="mt-4 text-sm text-muted-foreground/70 space-y-1">
            <div className="block sm:hidden">
              ✨ Tap any record to see it spin with authentic vinyl details
            </div>
            <div className="hidden sm:block">
              ✨ Hover over any record to see it spin with authentic vinyl details
            </div>
            <div className="text-xs text-muted-foreground/50 mt-2">
              Keyboard shortcuts: Press <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">F</kbd> for favorites, 
              <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs ml-1">S</kbd> to cycle sort, 
              <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs ml-1">/</kbd> to search
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div
          className="max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="Search albums, artists, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-card/50 border-border/50 focus:border-primary/50 focus:bg-card/80 text-foreground placeholder:text-muted-foreground"
              data-testid="input-search-collection"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                data-testid="button-clear-search"
              >
                <i className="fas fa-times text-sm"></i>
              </Button>
            )}
          </div>
          {searchQuery && filteredAndSortedAlbums.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Found {filteredAndSortedAlbums.length} album{filteredAndSortedAlbums.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
          {searchQuery && filteredAndSortedAlbums.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              No albums found matching "{searchQuery}"
            </p>
          )}
        </motion.div>

        {/* Filter and Sort Controls */}
        <motion.div
          className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Filter buttons */}
          <div className="flex gap-4">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              onClick={() => setSelectedFilter("all")}
              data-testid="filter-all"
            >
              All Albums ({(spinHistory || []).length})
            </Button>
            <Button
              variant={selectedFilter === "favorites" ? "default" : "outline"}
              onClick={() => setSelectedFilter("favorites")}
              data-testid="filter-favorites"
            >
              <i className="fas fa-heart text-red-500 mr-2"></i>
              Favourites ({(favorites || []).length})
            </Button>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="alphabetical">Album Name</SelectItem>
                <SelectItem value="artist">Artist Name</SelectItem>
                <SelectItem value="decade">Release Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Collection Stats */}
        {filteredAndSortedAlbums.length > 0 && (
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p className="text-sm text-muted-foreground mb-3">
              Showing {filteredAndSortedAlbums.length} album{filteredAndSortedAlbums.length !== 1 ? 's' : ''} 
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedFilter === "favorites" && " from your favourites"}
            </p>
            
            {/* Quick collection insights */}
            {!searchQuery && (
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground/60">
                <span>Total albums: {(spinHistory || []).length}</span>
                <span>Favorites: {(favorites || []).length}</span>
                {spinHistory && spinHistory.length > 0 && (
                  <span>
                    Unique artists: {new Set(spinHistory.map((s: any) => s.album?.artist).filter(Boolean)).size}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Collection Grid */}
        {filteredAndSortedAlbums.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {filteredAndSortedAlbums.map((item: any, index: number) => (
              <VinylRecord 
                key={item.id} 
                album={item.album} 
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-muted"
                 style={{
                   background: "radial-gradient(circle, #1a1a1a 20%, #0a0a0a 40%, #1a1a1a 60%, #0a0a0a 80%)"
                 }}>
              <div className="w-full h-full flex items-center justify-center">
                <i className="fas fa-record-vinyl text-4xl text-muted-foreground"></i>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {selectedFilter === "favorites" ? "No Favorites Yet" : "No Albums Yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {selectedFilter === "favorites" 
                ? "Heart your favorite albums to see them here! Try exploring different discovery modes to find new music you love." 
                : "Start spinning to build your collection! Each album you discover becomes part of your personal vinyl journey."
              }
            </p>
            
            {/* Tips for new users */}
            <div className="max-w-md mx-auto mb-6 text-left">
              <h4 className="text-sm font-medium text-foreground mb-3">
                {selectedFilter === "favorites" ? "💡 Pro Tips:" : "🎵 Getting Started:"}
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                {selectedFilter === "favorites" ? (
                  <>
                    <li>• Click the ❤️ button on any album to save it</li>
                    <li>• Use different discovery modes for varied recommendations</li>
                    <li>• Sort your favorites by date, album, or artist</li>
                  </>
                ) : (
                  <>
                    <li>• Try different discovery modes for personalized recommendations</li>
                    <li>• Each album you spin adds to your collection</li>
                    <li>• Heart albums you love to create a favorites playlist</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => window.location.href = "/"}
                className="bg-primary hover:bg-primary/90"
              >
                {selectedFilter === "favorites" ? "Discover Music" : "Spin Your First Album"}
              </Button>
              {selectedFilter === "favorites" && (
                <Button 
                  variant="outline"
                  onClick={() => setSelectedFilter("all")}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  View All Albums
                </Button>
              )}
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </FavoriteStatusContext.Provider>
  );
}