import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Star, Award, Crown, Zap, Target, CheckCircle, Medal, 
  Play, Package, Headphones, Flame, ArrowDown, RotateCcw, Search, 
  Compass, Apple, BookOpen, Infinity, Hammer, Wrench, Mountain, 
  Shield, Coins, Gem, Pickaxe, Plane, MapPin, Home, Moon, 
  Calendar, Cat, HelpCircle, Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Icon mapping for different trophy types - Updated with all new Minecraft-style icons
const TROPHY_ICONS = {
  // Basic actions
  Play: Play,
  Package: Package,
  Headphones: Headphones,
  
  // Streaks and time
  Flame: Flame,
  ArrowDown: ArrowDown,
  RotateCcw: RotateCcw,
  Zap: Zap,
  Crown: Crown,
  Calendar: Calendar,
  Moon: Moon,
  Sun: Sun,
  
  // Discovery and exploration
  Search: Search,
  Compass: Compass,
  Apple: Apple,
  BookOpen: BookOpen,
  Infinity: Infinity,
  Target: Target,
  
  // Building and crafting
  Hammer: Hammer,
  Wrench: Wrench,
  
  // Materials and progression
  Mountain: Mountain,
  Shield: Shield,
  Coins: Coins,
  Gem: Gem,
  Pickaxe: Pickaxe,
  
  // Achievement and status
  Trophy: Trophy,
  Award: Award,
  Medal: Medal,
  Star: Star,
  CheckCircle: CheckCircle,
  
  // Special and locations
  Plane: Plane,
  MapPin: MapPin,
  Home: Home,
  HelpCircle: HelpCircle,
  Pig: Cat, // Using Cat as replacement for Pig (lucide doesn't have Pig)
  
  // Fallback icons for compatibility
  Compass_old: Compass,
  Map: Award,
  Shuffle: Star,
  Music: Trophy,
  Sparkles: Star,
  UserPlus: Star,
  Users: Trophy,
} as const;

interface Trophy {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
  iconName: keyof typeof TROPHY_ICONS;
  requirement: {
    type: string;
    target: number;
    timeframe?: string;
    metadata?: Record<string, any>;
  };
  isActive: boolean;
  createdAt: Date;
}

interface UserTrophy {
  id: string;
  userId: string;
  trophyId: string;
  earnedAt: Date;
  progress: number;
}

interface TrophyWithProgress extends Trophy {
  userTrophy?: UserTrophy | null;
}

interface TrophyDisplayProps {
  trophies: TrophyWithProgress[];
  showProgress?: boolean;
  compact?: boolean;
  className?: string;
}

interface TrophyCardProps {
  trophy: TrophyWithProgress;
  showProgress?: boolean;
  compact?: boolean;
}

const TrophyCard = ({ trophy, showProgress = false, compact = false }: TrophyCardProps) => {
  const isEarned = !!trophy.userTrophy;
  const Icon = TROPHY_ICONS[trophy.iconName] || Trophy;

  const tierColors = {
    bronze: {
      bg: isEarned ? "bg-amber-50 dark:bg-amber-950/20" : "bg-gray-50 dark:bg-gray-800",
      border: isEarned ? "border-amber-200 dark:border-amber-800" : "border-gray-200 dark:border-gray-700",
      icon: isEarned ? "text-amber-600 dark:text-amber-400" : "text-gray-400 dark:text-gray-500",
      iconBg: isEarned ? "bg-amber-100 dark:bg-amber-900" : "bg-gray-100 dark:bg-gray-700",
      name: isEarned ? "text-amber-900 dark:text-amber-100" : "text-gray-600 dark:text-gray-400",
    },
    silver: {
      bg: isEarned ? "bg-gray-50 dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800",
      border: isEarned ? "border-gray-300 dark:border-gray-600" : "border-gray-200 dark:border-gray-700",
      icon: isEarned ? "text-gray-600 dark:text-gray-300" : "text-gray-400 dark:text-gray-500",
      iconBg: isEarned ? "bg-gray-100 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-700",
      name: isEarned ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400",
    },
    gold: {
      bg: isEarned ? "bg-yellow-50 dark:bg-yellow-950/20" : "bg-gray-50 dark:bg-gray-800",
      border: isEarned ? "border-yellow-200 dark:border-yellow-800" : "border-gray-200 dark:border-gray-700",
      icon: isEarned ? "text-yellow-600 dark:text-yellow-400" : "text-gray-400 dark:text-gray-500",
      iconBg: isEarned ? "bg-yellow-100 dark:bg-yellow-900" : "bg-gray-100 dark:bg-gray-700",
      name: isEarned ? "text-yellow-900 dark:text-yellow-100" : "text-gray-600 dark:text-gray-400",
    },
    diamond: {
      bg: isEarned ? "bg-blue-50 dark:bg-blue-950/20" : "bg-gray-50 dark:bg-gray-800",
      border: isEarned ? "border-blue-200 dark:border-blue-800" : "border-gray-200 dark:border-gray-700",
      icon: isEarned ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500",
      iconBg: isEarned ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700",
      name: isEarned ? "text-blue-900 dark:text-blue-100" : "text-gray-600 dark:text-gray-400",
    },
  };

  const colors = tierColors[trophy.tier];

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={cn(
          "p-3 rounded-lg border transition-all duration-200",
          colors.bg,
          colors.border,
          isEarned && "shadow-md"
        )}
        data-testid={`trophy-${trophy.id}`}
      >
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded", colors.iconBg)}>
            <Icon size={16} className={colors.icon} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("font-medium text-sm truncate", colors.name)}>
              {trophy.name}
            </p>
            {trophy.tier && (
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {trophy.tier}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "p-4 rounded-xl border transition-all duration-200 cursor-pointer",
        colors.bg,
        colors.border,
        isEarned && "shadow-lg"
      )}
      data-testid={`trophy-${trophy.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-3 rounded-lg", colors.iconBg)}>
          <Icon size={24} className={colors.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={cn("font-semibold", colors.name)}>
              {trophy.name}
            </h3>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full capitalize",
              trophy.tier === 'diamond' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
              trophy.tier === 'gold' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
              trophy.tier === 'silver' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
              'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
            )}>
              {trophy.tier}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {trophy.description}
          </p>

          {showProgress && !isEarned && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Progress</span>
                <span>0 / {trophy.requirement.target}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: '0%' }}
                />
              </div>
            </div>
          )}

          {isEarned && trophy.userTrophy && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Earned {format(new Date(trophy.userTrophy.earnedAt), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function TrophyDisplay({ 
  trophies, 
  showProgress = false, 
  compact = false, 
  className 
}: TrophyDisplayProps) {
  const earnedTrophies = trophies.filter(t => t.userTrophy);
  const unearned = trophies.filter(t => !t.userTrophy);

  // Group by category
  const categories = ['discovery', 'streak', 'genre', 'social'];
  const groupedTrophies = categories.reduce((acc, category) => {
    acc[category] = trophies.filter(t => t.category === category);
    return acc;
  }, {} as Record<string, TrophyWithProgress[]>);

  const categoryLabels = {
    discovery: 'Discovery',
    streak: 'Streaks',
    genre: 'Genre Explorer',
    social: 'Social'
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {earnedTrophies.length}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            Trophies Earned
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {earnedTrophies.filter(t => t.tier === 'gold').length}
          </div>
          <div className="text-sm text-amber-700 dark:text-amber-300">
            Gold Trophies
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {earnedTrophies.filter(t => t.tier === 'diamond').length}
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-300">
            Diamond Trophies
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {Math.round((earnedTrophies.length / trophies.length) * 100)}%
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            Completion
          </div>
        </div>
      </div>

      {/* Recent Trophies */}
      {earnedTrophies.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Achievements
          </h3>
          <div className={cn(
            "grid gap-4",
            compact ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"
          )}>
            {earnedTrophies
              .sort((a, b) => new Date(b.userTrophy!.earnedAt).getTime() - new Date(a.userTrophy!.earnedAt).getTime())
              .slice(0, compact ? 8 : 4)
              .map(trophy => (
                <TrophyCard
                  key={trophy.id}
                  trophy={trophy}
                  showProgress={showProgress}
                  compact={compact}
                />
              ))
            }
          </div>
        </div>
      )}

      {/* All Trophies by Category */}
      <div className="space-y-6">
        {Object.entries(groupedTrophies).map(([category, categoryTrophies]) => {
          if (categoryTrophies.length === 0) return null;
          
          return (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
              <div className={cn(
                "grid gap-4",
                compact ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"
              )}>
                {categoryTrophies
                  .sort((a, b) => {
                    // Earned trophies first, then by tier priority
                    if (a.userTrophy && !b.userTrophy) return -1;
                    if (!a.userTrophy && b.userTrophy) return 1;
                    
                    const tierOrder = { bronze: 1, silver: 2, gold: 3, diamond: 4 };
                    return tierOrder[a.tier] - tierOrder[b.tier];
                  })
                  .map(trophy => (
                    <TrophyCard
                      key={trophy.id}
                      trophy={trophy}
                      showProgress={showProgress}
                      compact={compact}
                    />
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}