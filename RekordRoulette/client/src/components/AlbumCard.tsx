import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useRef, useEffect } from "react";

interface Album {
  id: string;
  name: string;
  artist: string;
  year: number | null;
  coverUrl: string | null;
  deepLink: string;
}

interface AlbumCardProps {
  album: Album;
  onPlaySpotify: () => void;
  onMarkListened: () => void;
  onShare: () => void;
  onToggleFavorite?: () => void;
  isListened?: boolean;
  isLoading?: boolean;
  isPlayLoading?: boolean;
  isFavorite?: boolean;
  isFavoriteLoading?: boolean;
}

export default function AlbumCard({ 
  album, 
  onPlaySpotify, 
  onMarkListened, 
  onShare, 
  onToggleFavorite,
  isListened = false,
  isLoading = false,
  isPlayLoading = false,
  isFavorite = false,
  isFavoriteLoading = false
}: AlbumCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [shouldLoadImage, setShouldLoadImage] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadImage(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Optimized fallback image (smaller base64)
  const fallbackImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMmEyYTJhIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOCIgZmlsbD0iIzY2NjY2NiIvPgo8L3N2Zz4K";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
      data-testid="album-card"
    >
      <Card className="bg-card border-border shadow-2xl overflow-hidden">
        <CardContent className="p-8">
          {/* Album Cover */}
          <motion.div
            ref={imageRef}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="relative mb-6"
          >
            {/* Loading skeleton for image */}
            {(!shouldLoadImage || imageLoading) && !imageError && (
              <Skeleton className="w-full aspect-square rounded-xl shadow-lg" />
            )}
            
            {/* Only render image when it should load (lazy loading) */}
            {shouldLoadImage && (
              <img
                src={album.coverUrl || "/api/placeholder/400/400"}
                alt={`${album.name} by ${album.artist}`}
                className={`w-full aspect-square rounded-xl shadow-lg object-cover transition-all duration-500 ${
                  imageLoading ? 'opacity-0 absolute inset-0' : 'opacity-100'
                }`}
                loading="lazy"
                decoding="async"
                data-testid="album-cover"
                onLoad={() => {
                  setImageLoading(false);
                  setImageError(false);
                }}
                onError={(e) => {
                  setImageError(true);
                  setImageLoading(false);
                  (e.target as HTMLImageElement).src = fallbackImage;
                }}
              />
            )}
            
            {/* Error state with improved fallback */}
            {imageError && (
              <div className="w-full aspect-square rounded-xl shadow-lg bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground p-4">
                  <i className="fas fa-record-vinyl text-4xl mb-2 opacity-50"></i>
                  <p className="text-sm">Album artwork not available</p>
                </div>
              </div>
            )}
            
            {isListened && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-2"
              >
                <i className="fas fa-check text-sm"></i>
              </motion.div>
            )}
          </motion.div>
          
          {/* Album Info */}
          <div className="space-y-4 text-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2" data-testid="album-name">
                {album.name}
              </h3>
              <p className="text-xl text-muted-foreground" data-testid="album-artist">
                {album.artist}
              </p>
              {album.year && (
                <p className="text-muted-foreground" data-testid="album-year">
                  {album.year}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-6">
              {/* Primary Play Button - Vinyl Style */}
              <Button 
                onClick={onPlaySpotify}
                disabled={isPlayLoading}
                className="w-full bg-gray-800/90 hover:bg-gray-700/90 border border-gray-600/50 hover:border-green-500/60 text-green-400 hover:text-green-300 font-medium py-4 px-6 rounded-lg flex items-center justify-center space-x-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                data-testid="button-play-spotify"
              >
                {isPlayLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Starting playback...</span>
                  </>
                ) : (
                  <>
                    <i className="fab fa-spotify text-2xl"></i>
                    <div className="text-center">
                      <div className="text-xs opacity-90">From track 1 • No shuffle • Just like vinyl</div>
                    </div>
                  </>
                )}
              </Button>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={onMarkListened}
                  disabled={isListened || isLoading}
                  className="bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700/50 hover:border-amber-500/60 text-amber-300 hover:text-amber-200 font-medium py-3 px-6 rounded-lg flex-1 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-mark-listened"
                >
                  <i className={`fas ${isListened ? 'fa-check-circle' : 'fa-circle'} text-xl`}></i>
                  <span>{isListened ? 'Listened' : 'Mark as Listened'}</span>
                </Button>

                {onToggleFavorite && (
                  <Button 
                    onClick={onToggleFavorite}
                    disabled={isFavoriteLoading}
                    className={`font-medium py-3 px-6 rounded-lg flex-1 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isFavorite 
                        ? "bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 hover:text-red-300" 
                        : "bg-gray-800/40 hover:bg-gray-700/60 border border-gray-600/50 hover:border-red-500/60 text-gray-300 hover:text-red-400"
                    }`}
                    data-testid="button-toggle-favorite"
                  >
                    {isFavoriteLoading ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <i className={`fas fa-heart text-xl ${isFavorite ? 'text-red-500' : ''}`}></i>
                    )}
                    <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                  </Button>
                )}
              </div>

              <Button 
                onClick={onShare}
                className="w-full bg-gray-800/50 hover:bg-gray-700/60 border border-gray-600/40 hover:border-gray-500/60 text-gray-300 hover:text-gray-200 font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
                data-testid="button-share"
              >
                <i className="fas fa-share text-lg"></i>
                <span>Share My Spin</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
