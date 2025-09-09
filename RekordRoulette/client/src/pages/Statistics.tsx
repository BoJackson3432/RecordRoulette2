import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, Award, Users, Clock } from "lucide-react";
import WeeklyRecap from "@/components/WeeklyRecap";
import TrophyDisplay from "@/components/TrophyDisplay";
import { format, startOfWeek, subWeeks } from "date-fns";

export default function Statistics() {
  const [selectedTab, setSelectedTab] = useState<"recap" | "trophies" | "leaderboard">("recap");
  const [selectedWeek, setSelectedWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Fetch weekly recap data
  const { data: weeklyRecap, isLoading: recapLoading } = useQuery({
    queryKey: ["/api/profile/weekly-recap", selectedWeek.toISOString()],
  });

  // Fetch trophies data
  const { data: trophies, isLoading: trophiesLoading } = useQuery({
    queryKey: ["/api/trophies"],
  });

  // Fetch recent weekly stats for trends
  const { data: weeklyStats } = useQuery({
    queryKey: ["/api/profile/weekly-stats"],
  });

  const tabs = [
    { id: "recap", label: "Weekly Recap", icon: Calendar },
    { id: "trophies", label: "Trophies", icon: Award },
    { id: "leaderboard", label: "Leaderboards", icon: Users },
  ] as const;

  const getWeekOptions = () => {
    const options = [];
    for (let i = 0; i < 8; i++) {
      const week = subWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
      const label = i === 0 ? "This Week" : 
                   i === 1 ? "Last Week" : 
                   format(week, "MMM d");
      options.push({ value: week, label });
    }
    return options;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Your Music Statistics
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your listening habits, achievements, and compete with other music lovers
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === tab.id
                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {selectedTab === "recap" && (
            <div className="space-y-6">
              {/* Week Selector */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  View week:
                </label>
                <select
                  value={selectedWeek.toISOString()}
                  onChange={(e) => setSelectedWeek(new Date(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                  data-testid="week-selector"
                >
                  {getWeekOptions().map((option) => (
                    <option key={option.value.toISOString()} value={option.value.toISOString()}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weekly Recap Card */}
              {recapLoading ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-4">Loading your weekly recap...</p>
                </div>
              ) : weeklyRecap ? (
                <WeeklyRecap recap={weeklyRecap as any} />
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Data Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Start spinning some albums to see your weekly recap!
                  </p>
                </div>
              )}

              {/* Weekly Trends */}
              {weeklyStats && Array.isArray(weeklyStats) && weeklyStats.length > 1 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Weekly Trends
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Trend calculations would go here */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        +{(weeklyStats as any)[0].totalSpins - ((weeklyStats as any)[1]?.totalSpins || 0)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        vs last week
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === "trophies" && (
            <div>
              {trophiesLoading ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-4">Loading trophies...</p>
                </div>
              ) : trophies && Array.isArray(trophies) && trophies.length > 0 ? (
                <TrophyDisplay trophies={trophies as any} showProgress={true} />
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Trophies Available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Trophies haven't been initialized yet. Contact an admin to set them up!
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedTab === "leaderboard" && (
            <div className="space-y-6">
              {/* Placeholder leaderboard - to be implemented */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Leaderboards Coming Soon
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Compete with other music lovers and see who discovers the most albums!
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}