import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import StreakBadge from "@/components/StreakBadge";
import TrophyDisplay from "@/components/TrophyDisplay";
import AnalyticsInsights from "@/components/AnalyticsInsights";
import ProfileShareModal from "@/components/ProfileShareModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api, type UserProfile, type SpinHistory } from "@/lib/api";
import NotificationSettings from "@/components/NotificationSettings";
import { Award, Trophy } from "lucide-react";

export default function Profile() {
  const [, navigate] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Get user profile
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery<UserProfile>({
    queryKey: ["/api/me"],
    retry: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Get spin history
  const { data: spins, isLoading: isSpinsLoading } = useQuery<SpinHistory[]>({
    queryKey: ["/api/profile/spins"],
    enabled: !!profile,
    retry: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });

  // Get user's trophies
  const { data: trophies, isLoading: isTrophiesLoading } = useQuery({
    queryKey: ["/api/profile/trophies"],
    enabled: !!profile,
    retry: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.logout();
      // Small delay to show confirmation feedback
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  // Handle authentication errors
  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fab fa-spotify text-primary text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in with Spotify to access your profile and see your listening stats.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = "/auth/spotify/login"} 
              className="w-full bg-primary hover:bg-primary/90"
              data-testid="button-login-spotify"
            >
              <i className="fab fa-spotify mr-2"></i>
              Sign In with Spotify
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")} 
              className="w-full"
              data-testid="button-back-home"
            >
              <i className="fas fa-home mr-2"></i>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isProfileLoading) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-6" />
            <Skeleton className="h-10 w-48 mx-auto mb-2" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>

          {/* Streak Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-6">
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto mb-1" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Spins Skeleton */}
          <Card className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="w-16 h-6" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen py-20 px-4" data-testid="profile-page">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-full h-full rounded-full object-cover border-4 border-primary"
                data-testid="profile-avatar"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center border-4 border-primary">
                <i className="fas fa-user text-3xl text-white"></i>
              </div>
            )}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-foreground" data-testid="profile-name">
            {profile.displayName || "Music Lover"}
          </h2>
          <p className="text-muted-foreground text-lg">
            Vinyl Enthusiast since {new Date().getFullYear()}
          </p>
          
          {/* Share Stats Button */}
          <div className="flex gap-2 justify-center mt-4">
            <Button
              onClick={() => setShowShareModal(true)}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              data-testid="button-share-stats"
            >
              <i className="fas fa-share mr-2"></i>
              Share My Stats
            </Button>
            
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoggingOut}
                  data-testid="button-logout"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Signing out...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Logout
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Sign out of RecordRoulette?</AlertDialogTitle>
                <AlertDialogDescription>
                  You'll be signed out of your account and redirected to the home page. Your spins and streaks will be saved.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-logout">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmLogout}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  data-testid="button-confirm-logout"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>

        {/* Streak Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <motion.i 
                    className="fas fa-fire text-primary text-2xl"
                    animate={profile.streak.current > 0 ? { 
                      scale: [1, 1.2, 1],
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div className="text-3xl font-bold text-primary mb-2" data-testid="current-streak">
                  {profile.streak.current}
                </div>
                <div className="text-muted-foreground">Current Streak</div>
                <div className="text-sm text-muted-foreground mt-1">Days in a row</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-trophy text-accent text-2xl"></i>
                </div>
                <div className="text-3xl font-bold text-accent mb-2" data-testid="longest-streak">
                  {profile.streak.longest}
                </div>
                <div className="text-muted-foreground">Longest Streak</div>
                <div className="text-sm text-muted-foreground mt-1">Personal best</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-record-vinyl text-primary text-2xl"></i>
                </div>
                <div className="text-3xl font-bold text-primary mb-2" data-testid="total-spins">
                  {spins?.length || 0}
                </div>
                <div className="text-muted-foreground">Total Spins</div>
                <div className="text-sm text-muted-foreground mt-1">Albums discovered</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Discovery Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-8"
        >
          <AnalyticsInsights />
        </motion.div>

        {/* Recent Trophies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Award className="text-primary" size={24} />
                    Recent Achievements
                  </CardTitle>
                  <p className="text-muted-foreground">Your latest trophies and milestones</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/statistics")} data-testid="button-view-all-trophies">
                  <Trophy size={16} className="mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {isTrophiesLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : trophies && Array.isArray(trophies) && trophies.length > 0 ? (
                <TrophyDisplay 
                  trophies={(trophies as any).filter((t: any) => t.userTrophy).slice(0, 8)} 
                  compact={true} 
                />
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Trophies Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start spinning albums to earn your first achievements!
                  </p>
                  <Button onClick={() => navigate("/")} data-testid="button-start-spinning">
                    Start Spinning
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Spins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-2xl font-bold text-foreground">Recent Spins</CardTitle>
              <p className="text-muted-foreground">Your latest musical adventures</p>
            </CardHeader>
            
            <CardContent className="p-0">
              {isSpinsLoading ? (
                <div className="space-y-4 p-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="w-16 h-6" />
                    </div>
                  ))}
                </div>
              ) : spins && spins.length > 0 ? (
                <div className="divide-y divide-border">
                  {spins.map((spin) => (
                    <motion.div
                      key={spin.id}
                      className="p-6 flex items-center space-x-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/spin/${spin.id}`)}
                      whileHover={{ x: 4 }}
                      data-testid={`spin-item-${spin.id}`}
                    >
                      <img
                        src={spin.album.coverUrl || "/api/placeholder/64/64"}
                        alt={`${spin.album.name} by ${spin.album.artist}`}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMUExQTFBIiByeD0iOCIvPgo8cGF0aCBkPSJNMzIgNDBDMzYuNDE4MyA0MCA0MCAzNi40MTgzIDQwIDMyQzQwIDI3LjU4MTcgMzYuNDE4MyAyNCAzMiAyNEMyNy41ODE3IDI0IDI0IDI3LjU4MTcgMjQgMzJDMjQgMzYuNDE4MyAyNy41ODE3IDQwIDMyIDQwWiIgc3Ryb2tlPSIjNjY2NjY2IiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8cGF0aCBkPSJNMzIgMzZDMzQuMjA5MSAzNiAzNiAzNC4yMDkxIDM2IDMyQzM2IDI5Ljc5MDkgMzQuMjA5MSAyOCAzMiAyOEMyOS43OTA5IDI4IDI4IDI5Ljc5MDkgMjggMzJDMjggMzQuMjA5MSAyOS43OTA5IDM2IDMyIDM2WiIgZmlsbD0iIzMzMzMzMyIvPgo8L3N2Zz4K";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">
                          {spin.album.name}
                        </h4>
                        <p className="text-muted-foreground truncate">
                          {spin.album.artist}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Spun {new Date(spin.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {spin.listenedAt ? (
                          <>
                            <i className="fas fa-check-circle text-primary"></i>
                            <span className="text-sm text-muted-foreground">Listened</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-clock text-muted-foreground"></i>
                            <span className="text-sm text-muted-foreground">Pending</span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-record-vinyl text-muted-foreground text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Spins Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start spinning to build your listening history!
                  </p>
                  <Button onClick={() => navigate("/")} data-testid="button-start-spinning">
                    <i className="fas fa-play-circle mr-2"></i>
                    Start Spinning
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8"
        >
          <NotificationSettings />
        </motion.div>
      </div>

      {/* Profile Share Modal */}
      <ProfileShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        userStats={{
          totalSpins: spins?.length || 0,
          currentStreak: profile.streak.current,
          longestStreak: profile.streak.longest,
          favoritesCount: 0, // TODO: Add favorites count if available
          trophiesEarned: Array.isArray(trophies) ? trophies.length : 0,
        }}
        userProfile={{
          displayName: profile.displayName || "Music Lover",
          topGenres: [], // TODO: Add top genres if available
        }}
      />
    </div>
  );
}
