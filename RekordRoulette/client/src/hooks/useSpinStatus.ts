import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface SpinStatus {
  canSpin: boolean;
  reason: "available" | "daily_limit_reached";
  nextSpinAvailable: string | null;
  timeUntilNext: number;
  message?: string;
}

export function useSpinStatus() {
  const [countdown, setCountdown] = useState(0);

  const { data: status, isLoading, refetch } = useQuery<SpinStatus>({
    queryKey: ["/api/spin/can-spin"],
    enabled: false, // Completely disable this query for now
    refetchInterval: false,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });

  // Update countdown every second
  useEffect(() => {
    if (status && !status.canSpin && status.timeUntilNext > 0) {
      setCountdown(status.timeUntilNext);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            refetch(); // Refetch status when countdown reaches zero
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, refetch]);

  // Format countdown into human readable time
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return "Ready to spin!";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return {
    canSpin: status?.canSpin ?? true,
    isLoading,
    timeRemaining: countdown,
    timeRemainingFormatted: formatTimeRemaining(countdown),
    nextSpinAvailable: status?.nextSpinAvailable,
    message: status?.message,
    refetch,
  };
}