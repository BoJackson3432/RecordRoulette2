import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, Users, Share2, Calendar, TrendingUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  rank: number;
  isCurrentUser?: boolean;
  change?: number;
}

interface Competition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function Leaderboards() {
  const [selectedType, setSelectedType] = useState<'global' | 'weekly' | 'friends'>('global');
  const [selectedCategory, setSelectedCategory] = useState<'streaks' | 'discoveries' | 'referrals'>('streaks');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);

  // Get leaderboard data
  const { data: leaderboardData, isLoading, refetch } = useQuery({
    queryKey: ['/api/leaderboards', { type: selectedType, category: selectedCategory }],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboards?type=${selectedType}&category=${selectedCategory}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch leaderboards');
      return response.json();
    }
  });

  // Get user ranking
  const { data: userRanking } = useQuery({
    queryKey: ['/api/leaderboards/ranking'],
  });

  // Share competition result
  const shareMutation = useMutation({
    mutationFn: async ({ platform, entry, rank }: { platform: string; entry: LeaderboardEntry; rank: number }) => {
      const competition = `${selectedType}_${selectedCategory}`;
      const response = await fetch('/api/leaderboards/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          competition, 
          rank, 
          score: entry.score, 
          platform 
        })
      });
      if (!response.ok) throw new Error('Failed to create share content');
      return response.json();
    },
    onSuccess: (data, { platform }) => {
      if (typeof navigator.share === 'function' && platform === 'native') {
        navigator.share({
          title: data.title,
          text: data.description,
          url: data.shareUrl
        });
      } else {
        const shareText = `${data.title}\n\n${data.description}\n\n${data.shareUrl}\n\n${data.hashtags?.map((tag: string) => `#${tag}`).join(' ')}`;
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Share content copied!",
          description: `Paste this on ${platform} to share your achievement`,
        });
      }
      setShareDialogOpen(false);
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-yellow-500" size={20} />;
      case 2: return <Medal className="text-gray-400" size={20} />;
      case 3: return <Medal className="text-amber-600" size={20} />;
      default: return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold">#{rank}</div>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streaks': return <Zap className="text-yellow-500" size={16} />;
      case 'discoveries': return <TrendingUp className="text-blue-500" size={16} />;
      case 'referrals': return <Users className="text-green-500" size={16} />;
      default: return <Trophy size={16} />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'streaks': return 'Streak Champions';
      case 'discoveries': return 'Discovery Leaders';  
      case 'referrals': return 'Top Ambassadors';
      default: return 'Leaderboard';
    }
  };

  const getScoreLabel = (category: string, score: number) => {
    switch (category) {
      case 'streaks': return `${score} day streak`;
      case 'discoveries': return `${score} albums`;
      case 'referrals': return `${score} referrals`;
      default: return score.toString();
    }
  };

  const currentUserEntry = leaderboardData?.leaderboard?.find((entry: LeaderboardEntry) => entry.isCurrentUser);
  const competition = leaderboardData?.competition as Competition | undefined;

  const handleShare = (entry: LeaderboardEntry) => {
    setSelectedEntry(entry);
    setShareDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="text-yellow-500" size={24} />
              Leaderboards & Competitions
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Compete with friends and climb the global rankings
            </p>
          </div>
          {competition && (
            <div className="text-right">
              <Badge variant="secondary" className="text-sm">
                <Calendar size={12} className="mr-1" />
                {competition.name}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Ends {new Date(competition.endDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User's Current Ranking */}
        {userRanking && currentUserEntry && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getRankIcon(currentUserEntry.rank)}
                    <div>
                      <p className="font-medium">Your Rank</p>
                      <p className="text-sm text-muted-foreground">
                        {getScoreLabel(selectedCategory, currentUserEntry.score)}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleShare(currentUserEntry)}
                  className="flex items-center gap-2"
                  data-testid="button-share-rank"
                >
                  <Share2 size={14} />
                  Share Achievement
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as typeof selectedType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="global">🌍 Global</TabsTrigger>
            <TabsTrigger value="weekly">⚡ Weekly</TabsTrigger>
            <TabsTrigger value="friends">👥 Friends</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {/* Category selector */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={selectedCategory === 'streaks' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('streaks')}
                className="flex items-center gap-2"
                data-testid="button-category-streaks"
              >
                <Zap size={14} />
                Streaks
              </Button>
              <Button
                variant={selectedCategory === 'discoveries' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('discoveries')}
                className="flex items-center gap-2"
                data-testid="button-category-discoveries"
              >
                <TrendingUp size={14} />
                Discoveries
              </Button>
              {selectedType !== 'weekly' && (
                <Button
                  variant={selectedCategory === 'referrals' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('referrals')}
                  className="flex items-center gap-2"
                  data-testid="button-category-referrals"
                >
                  <Users size={14} />
                  Ambassadors
                </Button>
              )}
            </div>

            {/* Leaderboard */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  {getCategoryIcon(selectedCategory)}
                  {getCategoryLabel(selectedCategory)}
                </h3>
                <Badge variant="outline">
                  {leaderboardData?.leaderboard?.length || 0} players
                </Badge>
              </div>

              <AnimatePresence mode="wait">
                {leaderboardData?.leaderboard?.length > 0 ? (
                  <motion.div
                    key={`${selectedType}-${selectedCategory}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-2"
                  >
                    {leaderboardData.leaderboard.map((entry: LeaderboardEntry, index: number) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className={`transition-colors hover:bg-muted/50 ${
                            entry.isCurrentUser ? 'border-primary bg-primary/5' : ''
                          }`}
                          data-testid={`leaderboard-entry-${entry.rank}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 min-w-[2rem]">
                                  {getRankIcon(entry.rank)}
                                </div>
                                
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={entry.avatarUrl || undefined} />
                                  <AvatarFallback>
                                    {entry.displayName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0">
                                  <p className="font-medium truncate">
                                    {entry.displayName}
                                    {entry.isCurrentUser && (
                                      <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                                    )}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {getScoreLabel(selectedCategory, entry.score)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {entry.change !== undefined && (
                                  <Badge 
                                    variant={entry.change > 0 ? 'default' : entry.change < 0 ? 'destructive' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {entry.change > 0 ? '+' : ''}{entry.change}
                                  </Badge>
                                )}
                                
                                {entry.rank <= 10 && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleShare(entry)}
                                    data-testid={`button-share-${entry.rank}`}
                                  >
                                    <Share2 size={14} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Trophy className="mx-auto mb-4 text-muted-foreground" size={48} />
                      <h3 className="text-lg font-medium mb-2">No rankings yet</h3>
                      <p className="text-muted-foreground">
                        {selectedType === 'friends' ? 
                          'Add friends to see your circle\'s competition!' :
                          'Be the first to start competing!'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Tabs>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 size={20} />
                Share Your Achievement
              </DialogTitle>
            </DialogHeader>
            
            {selectedEntry && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getRankIcon(selectedEntry.rank)}
                    <span className="text-lg font-bold">
                      Rank #{selectedEntry.rank}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getScoreLabel(selectedCategory, selectedEntry.score)} in {selectedType} {getCategoryLabel(selectedCategory).toLowerCase()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => shareMutation.mutate({ platform: 'instagram', entry: selectedEntry, rank: selectedEntry.rank })}
                    disabled={shareMutation.isPending}
                    data-testid="button-share-instagram-leaderboard"
                  >
                    Instagram Stories
                  </Button>
                  <Button 
                    onClick={() => shareMutation.mutate({ platform: 'tiktok', entry: selectedEntry, rank: selectedEntry.rank })}
                    disabled={shareMutation.isPending}
                    data-testid="button-share-tiktok-leaderboard"
                  >
                    TikTok
                  </Button>
                  <Button 
                    onClick={() => shareMutation.mutate({ platform: 'twitter', entry: selectedEntry, rank: selectedEntry.rank })}
                    disabled={shareMutation.isPending}
                    data-testid="button-share-twitter-leaderboard"
                  >
                    Twitter
                  </Button>
                  {typeof navigator.share === 'function' && (
                    <Button 
                      onClick={() => shareMutation.mutate({ platform: 'native', entry: selectedEntry, rank: selectedEntry.rank })}
                      disabled={shareMutation.isPending}
                      data-testid="button-share-native-leaderboard"
                    >
                      Share Menu
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}