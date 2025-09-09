import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AlbumPreviewProps {
  albumId: string;
  albumName: string;
  artistName: string;
  coverUrl?: string;
  previewUrl?: string;
  onCommit: () => void;
  onSkip: () => void;
}

export default function AlbumPreview({
  albumId,
  albumName,
  artistName,
  coverUrl,
  previewUrl,
  onCommit,
  onSkip,
}: AlbumPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (audioRef.current && previewUrl) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setDuration(Math.min(audioRef.current.duration, 30));
        }
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      });
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [previewUrl, volume, isMuted]);

  const togglePlayback = () => {
    if (!audioRef.current || !previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else {
      audioRef.current.play();
      progressInterval.current = setInterval(() => {
        if (audioRef.current) {
          const currentTime = audioRef.current.currentTime;
          const progressPercent = (currentTime / duration) * 100;
          setProgress(progressPercent);

          if (currentTime >= duration) {
            setIsPlaying(false);
            setProgress(100);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
          }
        }
      }, 100);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = (progress / 100) * duration;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-gradient-to-br from-card via-card/95 to-accent/5 border-accent/20 overflow-hidden">
        <CardContent className="p-0">
          {/* Album Art & Info */}
          <div className="relative p-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={coverUrl || "/api/placeholder/120/120"}
                  alt={`${albumName} by ${artistName}`}
                  className="w-20 h-20 rounded-lg object-cover shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMUExQTFBIiByeD0iOCIvPgo8cGF0aCBkPSJNNjAgODBDNjkuOTQxMSA4MCA4MCA2OS45NDExIDgwIDYwQzgwIDUwLjA1ODkgNjkuOTQxMSA0MCA2MCA0MEM1MC4wNTg5IDQwIDQwIDUwLjA1ODkgNDAgNjBDNDAgNjkuOTQxMSA1MC4wNTg5IDgwIDYwIDgwWiIgc3Ryb2tlPSIjNjY2NjY2IiBzdHJva2Utd2lkdGg9IjIiLz4KPHA+dGggZD0iTTYwIDcyQzY2LjYyNzQgNzIgNzIgNjYuNjI3NCA3MiA2MEM3MiA1My4zNzI2IDY2LjYyNzQgNDggNjAgNDhDNTMuMzcyNiA0OCA0OCA1My4zNzI2IDQ4IDYwQzQ4IDY2LjYyNzQgNTMuMzcyNiA3MiA2MCA3MloiIGZpbGw9IiMzMzMzMzMiLz4KPC9zdmc+Cg==";
                  }}
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground leading-tight mb-1">{albumName}</h3>
                <p className="text-muted-foreground text-sm mb-3">{artistName}</p>
                
                {previewUrl ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="text-xs text-accent font-medium">30-second preview</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">No preview available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audio Player */}
          {previewUrl && (
            <>
              <audio
                ref={audioRef}
                src={previewUrl}
                preload="metadata"
              />
              
              <div className="px-6 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayback}
                    className="w-10 h-10 rounded-full p-0 border-accent/30 hover:bg-accent/10"
                    data-testid="button-preview-play-pause"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </Button>

                  <div className="flex-1">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
                    data-testid="button-preview-mute"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="px-6 pb-6 pt-2 border-t border-border/50">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onSkip}
                className="flex-1"
                data-testid="button-skip-album"
              >
                Skip This Album
              </Button>
              
              <Button
                onClick={onCommit}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                data-testid="button-commit-to-album"
              >
                Start Discovery
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              Your daily spin will only count once you start the discovery
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}