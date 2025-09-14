import { motion } from "framer-motion";
import { Calendar, Headphones, Music, TrendingUp, Star, Award } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

interface WeeklyRecapProps {
  recap: {
    user: string;
    weekStart: Date;
    weekEnd: Date;
    stats: {
      totalSpins: number;
      listenedSpins: number;
      uniqueArtists: number;
      uniqueGenres: number;
      streakDays: number;
      completionRate: number;
    };
    insights: {
      topGenre: { name: string; count: number } | null;
      topMode: { name: string; count: number } | null;
      diversityScore: number;
    };
    topAlbums: Array<{
      id: string;
      name: string;
      artist: string;
      coverUrl?: string;
    }>;
    achievements: any[];
  };
  className?: string;
}

export default function WeeklyRecap({ recap, className }: WeeklyRecapProps) {
  const weekLabel = `${format(new Date(recap.weekStart), "MMM d")} - ${format(new Date(recap.weekEnd), "MMM d")}`;
  
  const StatCard = ({ icon: Icon, label, value, suffix = "", color = "blue" }: {
    icon: any;
    label: string;
    value: number | string;
    suffix?: string;
    color?: "blue" | "purple" | "green" | "orange" | "red";
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
      purple: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
      green: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      orange: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
      red: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    };

    const iconClasses = {
      blue: "text-blue-600 dark:text-blue-400",
      purple: "text-purple-600 dark:text-purple-400",
      green: "text-green-600 dark:text-green-400",
      orange: "text-orange-600 dark:text-orange-400",
      red: "text-red-600 dark:text-red-400",
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          "p-4 rounded-xl border transition-all duration-200",
          colorClasses[color]
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-white dark:bg-gray-800", iconClasses[color])}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}{suffix}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg",
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Weekly Recap</h2>
            <p className="text-indigo-100">
              Hey {recap.user}! Here's your week in music
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-indigo-100">
              <Calendar size={16} />
              <span className="text-sm">{weekLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Music}
            label="Albums Spun"
            value={recap.stats.totalSpins}
            color="blue"
          />
          <StatCard
            icon={Headphones}
            label="Completed"
            value={recap.stats.listenedSpins}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            label="Artists"
            value={recap.stats.uniqueArtists}
            suffix=" new"
            color="purple"
          />
          <StatCard
            icon={Star}
            label="Genres"
            value={recap.stats.uniqueGenres}
            color="orange"
          />
        </div>

        {/* Insights Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-yellow-500" size={20} />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Completion Rate
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {recap.stats.completionRate}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Albums you fully listened to
            </p>
          </div>

          {recap.insights.topGenre && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Music className="text-pink-500" size={20} />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Top Genre
                </h3>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                {recap.insights.topGenre.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {recap.insights.topGenre.count} albums
              </p>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-blue-500" size={20} />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Diversity Score
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {recap.insights.diversityScore}/100
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Musical exploration
            </p>
          </div>
        </div>

        {/* Top Albums */}
        {recap.topAlbums.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Week's Favorites
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recap.topAlbums.slice(0, 5).map((album) => (
                <motion.div
                  key={album.id}
                  whileHover={{ scale: 1.05 }}
                  className="group cursor-pointer"
                  data-testid={`album-card-${album.id}`}
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
                    {album.coverUrl ? (
                      <img
                        src={album.coverUrl}
                        alt={`${album.name} cover`}
                        className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="text-gray-400" size={32} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {album.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {album.artist}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Active Days Streak */}
        {recap.stats.streakDays > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Calendar className="text-white" size={20} />
              </div>
              <div>
                <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                  {recap.stats.streakDays} Active Days
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  You listened to music {recap.stats.streakDays} days this week!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}