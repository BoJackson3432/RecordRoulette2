import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Zap, 
  BarChart3, 
  Settings, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Music, 
  Calendar,
  Check,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const TIER_COLORS = {
  free: 'bg-gray-500',
  premium: 'bg-blue-500',
  pro: 'bg-purple-500'
};

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function PremiumDashboard() {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'premium' | 'pro'>('premium');
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Get premium status
  const { data: premiumStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/premium/status'],
  });

  // Get advanced analytics (only if premium)
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/premium/analytics', analyticsTimeRange],
    queryFn: async () => {
      const response = await fetch(`/api/premium/analytics?timeRange=${analyticsTimeRange}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 403) {
          return null; // Not premium
        }
        throw new Error('Failed to get analytics');
      }
      return response.json();
    },
    enabled: premiumStatus?.isPremium
  });

  // Upgrade to premium
  const upgradeMutation = useMutation({
    mutationFn: async (tier: 'premium' | 'pro') => {
      const response = await fetch('/api/premium/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier, paymentMethod: 'simulated' })
      });
      if (!response.ok) throw new Error('Failed to upgrade');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upgrade successful!",
        description: `Welcome to ${selectedTier} tier! Enjoy unlimited spins and advanced features.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/premium/status'] });
      setUpgradeDialogOpen(false);
    }
  });

  // Update settings
  const settingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch('/api/premium/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/premium/status'] });
    }
  });

  const handleUpgrade = (tier: 'premium' | 'pro') => {
    setSelectedTier(tier);
    upgradeMutation.mutate(tier);
  };

  const getTierBadge = (tier: string) => {
    const config = {
      free: { label: 'Free', icon: Music, color: 'secondary' },
      premium: { label: 'Premium', icon: Sparkles, color: 'default' },
      pro: { label: 'Pro', icon: Crown, color: 'default' }
    };
    
    const tierConfig = config[tier as keyof typeof config] || config.free;
    const IconComponent = tierConfig.icon;
    
    return (
      <Badge variant={tierConfig.color as any} className="flex items-center gap-1">
        <IconComponent size={12} />
        {tierConfig.label}
      </Badge>
    );
  };

  if (statusLoading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Premium Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                {premiumStatus?.isPremium ? (
                  <Crown className="text-yellow-500" size={24} />
                ) : (
                  <Zap className="text-primary" size={24} />
                )}
                Premium Dashboard
                {getTierBadge(premiumStatus?.tier)}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {premiumStatus?.isPremium ? 
                  'Enjoy unlimited music discovery and advanced features!' :
                  'Upgrade to unlock unlimited spins and powerful analytics'
                }
              </p>
            </div>
            
            {!premiumStatus?.isPremium && (
              <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2" data-testid="button-upgrade-premium">
                    <Sparkles size={16} />
                    Upgrade Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Crown className="text-yellow-500" size={20} />
                      Choose Your Premium Plan
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Premium Tier */}
                    <Card className={`cursor-pointer transition-colors ${
                      selectedTier === 'premium' ? 'border-primary bg-primary/5' : ''
                    }`} onClick={() => setSelectedTier('premium')}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="text-blue-500" size={20} />
                            Premium
                          </CardTitle>
                          <span className="text-2xl font-bold">$9.99</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Perfect for music lovers</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          'Unlimited Spins',
                          'Advanced Analytics', 
                          'Mood Discovery',
                          'Custom Themes',
                          'Priority Support',
                          'Export Data'
                        ].map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <Check className="text-green-500" size={16} />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Pro Tier */}
                    <Card className={`cursor-pointer transition-colors relative ${
                      selectedTier === 'pro' ? 'border-primary bg-primary/5' : ''
                    }`} onClick={() => setSelectedTier('pro')}>
                      <Badge className="absolute -top-2 left-4 bg-purple-500">Most Popular</Badge>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Crown className="text-purple-500" size={20} />
                            Pro
                          </CardTitle>
                          <span className="text-2xl font-bold">$19.99</span>
                        </div>
                        <p className="text-sm text-muted-foreground">For power users & curators</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          'Everything in Premium',
                          'Advanced AI Recommendations',
                          'Custom Discovery Modes',
                          'Playlist Integration',
                          'Early Access Features',
                          'Personal Music Concierge'
                        ].map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <Check className="text-green-500" size={16} />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
                      Maybe Later
                    </Button>
                    <Button 
                      onClick={() => handleUpgrade(selectedTier)}
                      disabled={upgradeMutation.isPending}
                      className="flex items-center gap-2"
                      data-testid={`button-confirm-upgrade-${selectedTier}`}
                    >
                      {upgradeMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      Upgrade to {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>

        {premiumStatus?.usage && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {premiumStatus.isUnlimited ? '∞' : premiumStatus.usage.monthlySpins}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Spins</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {premiumStatus.usage.dailyAverage}
                </div>
                <div className="text-sm text-muted-foreground">Daily Average</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {premiumStatus.isUnlimited ? '∞' : premiumStatus.dailySpinLimit}
                </div>
                <div className="text-sm text-muted-foreground">Daily Limit</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {premiumStatus.usage.standardLimitExceeded ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-muted-foreground">Exceeded Free Limit</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          <TabsTrigger value="features">⚡ Features</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          {!premiumStatus?.isPremium ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Get detailed insights into your music discovery patterns, listening habits, and preferences with Premium.
                </p>
                <Button 
                  onClick={() => setUpgradeDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Time Range Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Time Range:</span>
                <div className="flex gap-1">
                  {['week', 'month', 'year'].map((range) => (
                    <Button
                      key={range}
                      variant={analyticsTimeRange === range ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAnalyticsTimeRange(range as any)}
                      data-testid={`button-timerange-${range}`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {analytics.overview.totalSpins}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Spins</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.overview.completedListens}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.overview.completionRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Completion Rate</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics.overview.uniqueAlbums}
                    </div>
                    <div className="text-sm text-muted-foreground">Unique Albums</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {analytics.overview.uniqueArtists}
                    </div>
                    <div className="text-sm text-muted-foreground">Artists</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Listening Patterns */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock size={18} />
                      Listening Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.patterns.hourly.filter((h: any) => h.count > 0)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Genres */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music size={18} />
                      Top Genres
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={analytics.preferences.topGenres.slice(0, 5)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="count"
                          label={({ genre, count }) => `${genre} (${count})`}
                        >
                          {analytics.preferences.topGenres.slice(0, 5).map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Weekly Pattern */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar size={18} />
                      Weekly Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.patterns.weekly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Discovery Modes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp size={18} />
                      Discovery Modes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.preferences.discoveryModes.map((mode: any, index: number) => (
                        <div key={mode.mode} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{mode.mode.replace('_', ' ')}</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(mode.count / Math.max(...analytics.preferences.discoveryModes.map((m: any) => m.count))) * 100} 
                              className="w-20 h-2" 
                            />
                            <span className="text-sm text-muted-foreground min-w-[2rem]">
                              {mode.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : analyticsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading analytics...</p>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {premiumStatus?.features?.map((feature: string, index: number) => (
              <Card key={feature}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span className="font-medium">{feature}</span>
                </CardContent>
              </Card>
            )) || (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <X className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <h3 className="text-lg font-medium mb-2">No Premium Features</h3>
                  <p className="text-muted-foreground">Upgrade to unlock powerful features!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={18} />
                Premium Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Keyboard Shortcuts</p>
                  <p className="text-sm text-muted-foreground">
                    Enable keyboard shortcuts for faster navigation
                  </p>
                </div>
                <Switch
                  checked={premiumStatus?.usage?.keyboardShortcuts || false}
                  onCheckedChange={(checked) => 
                    settingsMutation.mutate({ keyboardShortcuts: checked })
                  }
                  disabled={!premiumStatus?.isPremium}
                  data-testid="switch-keyboard-shortcuts"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Custom Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Current theme: {premiumStatus?.usage?.customTheme || 'Default'}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled={!premiumStatus?.isPremium}
                  data-testid="button-customize-theme"
                >
                  Customize
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}