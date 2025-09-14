import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, PieChart, Clock, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WeeklyProgressCard from "./WeeklyProgressCard";

interface AnalyticsData {
  totalSpins: number;
  modePreferences: {
    mode: string;
    count: number;
    percentage: number;
  }[];
  favoriteMode: string | null;
  insights: string[];
  genreDistribution: {
    genre: string;
    count: number;
  }[];
  recentActivity: {
    last7Days: number;
    last30Days: number;
  };
  weeklyProgress: {
    currentWeekSpins: number;
    weekStartDate: string;
    daysCompleted: boolean[];
    motivationalMessage: string;
    progressPercentage: number;
  };
}

export default function AnalyticsInsights() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/profile/analytics"],
    retry: false,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Start spinning to see your music discovery insights!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Progress Card */}
      <WeeklyProgressCard />

      {/* Insights Cards */}
      {analytics.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400 drop-shadow-md animate-pulse" />
            <h3 className="text-lg font-bold text-foreground vinyl-text-gradient bg-clip-text">Your Discovery Insights</h3>
          </div>
          
          {analytics.insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden border-0 ${
                index % 4 === 0 ? 'insight-card-gradient-1' : 
                index % 4 === 1 ? 'insight-card-gradient-2' : 
                index % 4 === 2 ? 'insight-card-gradient-3' : 'insight-card-gradient-4'
              }`}>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                <CardContent className="p-4 relative z-10">
                  <p className="text-white text-sm font-medium drop-shadow-sm">{insight}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Mode Preferences */}
        <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="w-4 h-4 text-accent" />
              Discovery Modes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.modePreferences.slice(0, 3).map((mode, index) => (
                <div key={mode.mode} className="flex items-center justify-between">
                  <span className="text-sm text-foreground font-medium">{mode.mode}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-gradient-to-r from-accent to-pink-400' : 
                          index === 1 ? 'bg-gradient-to-r from-primary to-emerald-400' : 
                          'bg-gradient-to-r from-yellow-400 to-orange-400'
                        }`}
                        style={{ width: `${mode.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-foreground font-bold">{mode.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground font-medium">Last 7 days</span>
                  <span className="text-sm font-bold text-primary">{analytics.recentActivity.last7Days}</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((analytics.recentActivity.last7Days / 7) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground font-medium">Last 30 days</span>
                  <span className="text-sm font-bold text-accent">{analytics.recentActivity.last30Days}</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-pink-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((analytics.recentActivity.last30Days / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Stats */}
        <Card className="border-yellow-400/20 bg-gradient-to-br from-card to-yellow-400/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              Discovery Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">{analytics.totalSpins}</div>
                <div className="text-xs text-foreground font-medium">Total Albums Discovered</div>
              </div>
              
              {analytics.genreDistribution.length > 0 && (
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-2">Top Genre</div>
                  <div className="text-sm font-bold text-foreground">
                    {analytics.genreDistribution[0].genre}
                  </div>
                  <div className="text-xs text-yellow-400 font-medium">
                    {analytics.genreDistribution[0].count} albums
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}