import { useCallback, useRef } from 'react';

export function useVinylSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Stop audio function for cleanup - immediate and complete stop
  const stopVinylSound = useCallback(() => {
    // Clear any pending timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (audioRef.current) {
      // Force immediate stop with no fade
      audioRef.current.volume = 0;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = ''; // Clear the source completely
      audioRef.current = null;
    }
  }, []);
  
  // Play vinyl rewind sound synchronized with 3.5s animation  
  const playVinylRewindSound = useCallback(async () => {
    try {
      // Stop any existing audio first
      stopVinylSound();
      
      const audio = new Audio('/sounds/vinyl-rewind.wav');
      audioRef.current = audio;
      
      // Configure audio to match animation timing
      audio.volume = 0.12; // Keep volume low as requested (12%)
      audio.currentTime = 0;
      
      // Set up forced stop after exactly 3.5 seconds (animation duration)
      timerRef.current = setTimeout(() => {
        stopVinylSound();
      }, 3500);
      
      // Clear timer if audio ends naturally
      audio.addEventListener('ended', () => {
        stopVinylSound();
      }, { once: true });
      
      // Adjust playback rate to match 3.5 second duration if needed
      audio.addEventListener('loadedmetadata', () => {
        const audioDuration = audio.duration;
        const animationDuration = 3.5;
        
        // Adjust playback rate to sync with animation
        if (audioDuration > 0) {
          audio.playbackRate = audioDuration / animationDuration;
        }
      }, { once: true });
      
      // Play the sound and handle errors gracefully  
      await audio.play().catch(error => {
        console.warn('Vinyl rewind audio playback failed:', error);
      });
      
      return audio;
    } catch (error) {
      console.warn('Could not load vinyl rewind sound:', error);
    }
  }, [stopVinylSound]);

  return { playVinylRewindSound, stopVinylSound };
}