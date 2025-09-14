import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Users, Trophy, Gift, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/queryClient";

export default function ReferralDashboard() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Get referral code
  const { data: referralData } = useQuery({
    queryKey: ['/api/referrals/code'],
  });

  // Get referral stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/referrals/stats'],
  });

  // Share referral mutation
  const shareMutation = useMutation({
    mutationFn: async (platform: string) => {
      const response = await fetch('/api/referrals/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ platform })
      });
      if (!response.ok) throw new Error('Failed to create share content');
      return response.json();
    },
    onSuccess: (data, platform) => {
      if (navigator.share && platform === 'native') {
        navigator.share({
          title: 'RecordRoulette - Music Discovery',
          text: data.content,
          url: data.shareUrl
        });
      } else {
        // Copy to clipboard and show instructions
        navigator.clipboard.writeText(data.content);
        toast({
          title: "Share content copied!",
          description: `Paste this on ${platform} to share your referral link`,
        });
      }
    }
  });

  const copyReferralCode = async () => {
    if (referralData?.code) {
      await navigator.clipboard.writeText(referralData.code);
      setCopiedCode(true);
      toast({
        title: "Copied!",
        description: "Your referral code has been copied to clipboard",
      });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyReferralLink = async () => {
    if (referralData?.code) {
      const link = `${window.location.origin}/?ref=${referralData.code}`;
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link copied!",
        description: "Your referral link has been copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTier = stats?.stats?.currentTier;
  const nextTier = stats?.stats?.nextTier;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-primary" size={24} />
              Referral Dashboard
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Share RecordRoulette with friends and earn rewards
            </p>
          </div>
          {currentTier && (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {currentTier.badge} {currentTier.title}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats?.stats?.totalReferrals || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Referrals</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.stats?.successfulReferrals || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Friends</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentTier?.bonusSpins || 0}
                </div>
                <div className="text-sm text-muted-foreground">Bonus Spins</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {nextTier ? `${nextTier.required} left` : 'Max Tier!'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {nextTier ? `To ${nextTier.title}` : 'Achievement'}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="share">Share & Earn</TabsTrigger>
            <TabsTrigger value="referrals">My Referrals</TabsTrigger>
            <TabsTrigger value="rewards">Tier Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Referral Code</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Share this code with friends to earn bonus spins
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input 
                    value={referralData?.code || ''} 
                    readOnly 
                    className="font-mono text-lg"
                    data-testid="input-referral-code"
                  />
                  <Button 
                    onClick={copyReferralCode}
                    variant="outline"
                    data-testid="button-copy-code"
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={copyReferralLink}
                    variant="outline"
                    data-testid="button-copy-link"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Copy Link
                  </Button>

                  <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-open-share">
                        <Share2 size={16} className="mr-2" />
                        Share on Social
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share on Social Media</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={() => shareMutation.mutate('instagram')}
                          variant="outline"
                          disabled={shareMutation.isPending}
                          data-testid="button-share-instagram"
                        >
                          Instagram Stories
                        </Button>
                        <Button 
                          onClick={() => shareMutation.mutate('tiktok')}
                          variant="outline"
                          disabled={shareMutation.isPending}
                          data-testid="button-share-tiktok"
                        >
                          TikTok
                        </Button>
                        <Button 
                          onClick={() => shareMutation.mutate('twitter')}
                          variant="outline"
                          disabled={shareMutation.isPending}
                          data-testid="button-share-twitter"
                        >
                          Twitter
                        </Button>
                        {navigator.share && (
                          <Button 
                            onClick={() => shareMutation.mutate('native')}
                            variant="outline"
                            disabled={shareMutation.isPending}
                            data-testid="button-share-native"
                          >
                            Share Menu
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            {stats?.referrals?.length > 0 ? (
              <div className="space-y-2">
                {stats.referrals.map((referral: any, index: number) => (
                  <Card key={referral.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {referral.referredUserName || referral.referredUserEmail || 'New User'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Joined {new Date(referral.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant={referral.rewardClaimed ? "default" : "secondary"}>
                          {referral.rewardClaimed ? "Active" : "Pending"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <h3 className="text-lg font-medium mb-2">No referrals yet</h3>
                  <p className="text-muted-foreground">
                    Start sharing your referral code to see your referrals here!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="space-y-4">
              {Object.entries({
                BRONZE: { min: 1, max: 4, badge: '🥉', title: 'Bronze Ambassador', spins: 5 },
                SILVER: { min: 5, max: 9, badge: '🥈', title: 'Silver Ambassador', spins: 15 },
                GOLD: { min: 10, max: 19, badge: '🥇', title: 'Gold Ambassador', spins: 25 },
                PLATINUM: { min: 20, max: Infinity, badge: '💎', title: 'Platinum Ambassador', spins: 50 }
              }).map(([tier, config]) => {
                const isCurrentTier = currentTier?.title === config.title;
                const isUnlocked = (stats?.stats?.successfulReferrals || 0) >= config.min;
                const progress = Math.min(100, ((stats?.stats?.successfulReferrals || 0) / config.min) * 100);

                return (
                  <Card key={tier} className={isCurrentTier ? 'border-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{config.badge}</span>
                          <div>
                            <div className="font-medium">{config.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {config.min === 1 ? '1 referral' : `${config.min}+ referrals`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">+{config.spins} bonus spins</div>
                          {isCurrentTier && (
                            <Badge variant="default" className="mt-1">Current</Badge>
                          )}
                        </div>
                      </div>
                      {!isUnlocked && (
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}