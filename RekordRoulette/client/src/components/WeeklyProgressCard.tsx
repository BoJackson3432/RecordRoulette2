import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Target, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WeeklyProgressData {
  currentWeekSpins: number;
  weekStartDate: string;
  daysCompleted: boolean[];
  motivationalMessage: string;
  progressPercentage: number;
}

interface AnalyticsData {
  weeklyProgress: WeeklyProgressData;
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyProgressCard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/profile/analytics"],
    retry: false,
  });

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading progress...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics?.weeklyProgress) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start your weekly discovery journey!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { currentWeekSpins, daysCompleted, motivationalMessage, progressPercentage } = analytics.weeklyProgress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5"></div>
        
        <CardHeader className="pb-4 relative z-10">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              Weekly Progress
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 relative z-10">
          {/* Progress Overview */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                {currentWeekSpins}
              </span>
              <span className="text-muted-foreground">/ 7 days</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-muted/50"
            />
            <p className="text-sm text-muted-foreground font-medium">
              {motivationalMessage}
            </p>
          </div>

          {/* Daily Progress Indicators */}
          <div className="grid grid-cols-7 gap-2 mt-4">
            {dayNames.map((day, index) => (
              <motion.div
                key={day}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="text-xs text-muted-foreground font-medium">
                  {day}
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  daysCompleted[index] 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 shadow-lg' 
                    : 'border-muted bg-muted/20'
                }`}>
                  {daysCompleted[index] && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Motivational Footer */}
          {currentWeekSpins === 7 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
            >
              <div className="flex items-center gap-2 text-green-400">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold">Perfect Week Achieved! 🎉</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}