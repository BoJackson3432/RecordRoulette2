import { db } from "../db";
import { 
  trophies, 
  userTrophies, 
  users, 
  spins, 
  streaks,
  albums,
  type Trophy, 
  type UserTrophy,
  type InsertTrophy 
} from "@shared/schema";
import { eq, and, count, desc, sql } from "drizzle-orm";

// Type helper for requirements
type TrophyRequirement = {
  type: string;
  target: number;
  timeframe?: string;
  metadata?: Record<string, any>;
};

// Trophy definitions with requirements and metadata - Minecraft-inspired fun achievements!
const TROPHY_DEFINITIONS: InsertTrophy[] = [
  // 🎵 FIRST STEPS - Getting Started
  {
    name: "Getting Wood",
    description: "Spin your very first album on the roulette",
    category: "discovery",
    tier: "bronze",
    iconName: "Play",
    requirement: { type: "total_spins", target: 1 } as TrophyRequirement,
  },
  {
    name: "Taking Inventory",
    description: "Spin 10 albums and start building your music collection",
    category: "discovery", 
    tier: "bronze",
    iconName: "Package",
    requirement: { type: "total_spins", target: 10 } as TrophyRequirement,
  },
  {
    name: "Acquire Hardware",
    description: "Actually listen to your first full album like a true music lover",
    category: "social",
    tier: "bronze",
    iconName: "Headphones",
    requirement: { type: "listened_spins", target: 1 } as TrophyRequirement,
  },

  // 🔥 STREAK MASTERS - Daily Consistency
  {
    name: "Hot Stuff",
    description: "Keep the music burning for 3 days straight",
    category: "streak",
    tier: "bronze",
    iconName: "Flame",
    requirement: { type: "current_streak", target: 3 } as TrophyRequirement,
  },
  {
    name: "We Need to Go Deeper",
    description: "Descend into a 7-day musical journey",
    category: "streak",
    tier: "silver",
    iconName: "ArrowDown",
    requirement: { type: "current_streak", target: 7 } as TrophyRequirement,
  },
  {
    name: "Return to Sender",
    description: "Come back to music every day for 14 days",
    category: "streak",
    tier: "silver",
    iconName: "RotateCcw",
    requirement: { type: "current_streak", target: 14 } as TrophyRequirement,
  },
  {
    name: "Into Fire",
    description: "Survive the blazing intensity of a 30-day streak",
    category: "streak",
    tier: "gold",
    iconName: "Zap",
    requirement: { type: "current_streak", target: 30 } as TrophyRequirement,
  },
  {
    name: "Postmortal",
    description: "Achieve immortality with a legendary 100-day streak",
    category: "streak",
    tier: "diamond",
    iconName: "Crown",
    requirement: { type: "current_streak", target: 100 } as TrophyRequirement,
  },

  // 🎨 GENRE ADVENTURES - Musical Diversity
  {
    name: "Monster Hunter",
    description: "Hunt down 5 different music genres",
    category: "genre",
    tier: "bronze",
    iconName: "Search",
    requirement: { type: "unique_genres", target: 5 } as TrophyRequirement,
  },
  {
    name: "Adventuring Time",
    description: "Explore 10 musical territories like a true adventurer",
    category: "genre",
    tier: "bronze",
    iconName: "Compass",
    requirement: { type: "unique_genres", target: 10 } as TrophyRequirement,
  },
  {
    name: "A Balanced Diet",
    description: "Consume 15 different musical flavors for optimal health",
    category: "genre",
    tier: "silver",
    iconName: "Apple",
    requirement: { type: "unique_genres", target: 15 } as TrophyRequirement,
  },
  {
    name: "Serious Dedication",
    description: "Master 25 genres with the dedication of a true scholar",
    category: "genre",
    tier: "gold",
    iconName: "BookOpen",
    requirement: { type: "unique_genres", target: 25 } as TrophyRequirement,
  },
  {
    name: "The End?",
    description: "Conquer all 35+ genres - is this the end of your journey?",
    category: "genre",
    tier: "diamond",
    iconName: "Infinity",
    requirement: { type: "unique_genres", target: 35 } as TrophyRequirement,
  },

  // 🏗️ BUILDER SERIES - Volume Achievements
  {
    name: "Benchmarking",
    description: "Craft your first workstation by listening to 5 full albums",
    category: "social",
    tier: "bronze",
    iconName: "Hammer",
    requirement: { type: "listened_spins", target: 5 } as TrophyRequirement,
  },
  {
    name: "Getting an Upgrade",
    description: "Upgrade your setup by completing 25 albums",
    category: "social",
    tier: "silver",
    iconName: "Wrench",
    requirement: { type: "listened_spins", target: 25 } as TrophyRequirement,
  },
  {
    name: "Librarian",
    description: "Build an impressive library of 50 completed albums",
    category: "social",
    tier: "silver",
    iconName: "BookOpen",
    requirement: { type: "listened_spins", target: 50 } as TrophyRequirement,
  },
  {
    name: "Overpowered",
    description: "Become unstoppably powerful with 100 completed albums",
    category: "social",
    tier: "gold",
    iconName: "Zap",
    requirement: { type: "listened_spins", target: 100 } as TrophyRequirement,
  },
  {
    name: "How Did We Get Here?",
    description: "The ultimate challenge - complete 250 albums",
    category: "social",
    tier: "diamond",
    iconName: "HelpCircle",
    requirement: { type: "listened_spins", target: 250 } as TrophyRequirement,
  },

  // 🎰 DISCOVERY MASTERS - Exploration Feats
  {
    name: "Stone Age",
    description: "Primitive but effective - discover 25 albums the old way",
    category: "discovery",
    tier: "bronze",
    iconName: "Mountain",
    requirement: { type: "total_spins", target: 25 } as TrophyRequirement,
  },
  {
    name: "Iron Age", 
    description: "Forge ahead with 75 album discoveries",
    category: "discovery",
    tier: "silver", 
    iconName: "Shield",
    requirement: { type: "total_spins", target: 75 } as TrophyRequirement,
  },
  {
    name: "Gold Rush",
    description: "Strike it rich with 150 golden album discoveries",
    category: "discovery",
    tier: "gold",
    iconName: "Coins",
    requirement: { type: "total_spins", target: 150 } as TrophyRequirement,
  },
  {
    name: "Diamond!",
    description: "Unearth the rarest treasures - 300 album discoveries",
    category: "discovery",
    tier: "diamond",
    iconName: "Gem",
    requirement: { type: "total_spins", target: 300 } as TrophyRequirement,
  },

  // 🧪 SPECIAL DISCOVERIES - Mode-Specific
  {
    name: "Time to Mine!",
    description: "Dig deep into recommendations and find 15 hidden gems",
    category: "discovery",
    tier: "bronze",
    iconName: "Pickaxe",
    requirement: { type: "discovery_mode", target: 15, metadata: { mode: "recommendations" } } as TrophyRequirement,
  },
  {
    name: "Sky's the Limit",
    description: "Soar to new heights by discovering 10 completely new artists",
    category: "discovery",
    tier: "silver",
    iconName: "Plane",
    requirement: { type: "discovery_mode", target: 10, metadata: { mode: "new_artists" } } as TrophyRequirement,
  },
  {
    name: "Two Birds, One Arrow",
    description: "Kill two birds with one stone - find 20 similar artist albums",
    category: "discovery",
    tier: "bronze",
    iconName: "Target",
    requirement: { type: "discovery_mode", target: 20, metadata: { mode: "similar_artists" } } as TrophyRequirement,
  },

  // 🏆 LEGENDARY STATUS - Ultimate Achievements
  {
    name: "Local Legend",
    description: "Become a legend in your area with 500+ total discoveries",
    category: "discovery",
    tier: "diamond",
    iconName: "MapPin",
    requirement: { type: "total_spins", target: 500 } as TrophyRequirement,
  },
  {
    name: "Hero of the Village",
    description: "Save the music village by completing 500+ albums",
    category: "social",
    tier: "diamond",
    iconName: "Home",
    requirement: { type: "listened_spins", target: 500 } as TrophyRequirement,
  },

  // 🎪 RARE & FUN - Special Achievements
  {
    name: "Perfect Week",
    description: "Spin your daily album every single day for a week",
    category: "streak",
    tier: "gold",
    iconName: "Calendar",
    requirement: { type: "perfect_week", target: 1 } as TrophyRequirement,
  },
  {
    name: "Early Bird",
    description: "Spin your daily album before 9 AM (commitment!)",
    category: "discovery",
    tier: "silver",
    iconName: "Sun",
    requirement: { type: "early_morning_spins", target: 1 } as TrophyRequirement,
  },
  {
    name: "Dedication",
    description: "Listen to music every single day for an entire month",
    category: "streak",
    tier: "gold",
    iconName: "Calendar",
    requirement: { type: "perfect_month", target: 1 } as TrophyRequirement,
  },
  {
    name: "When Pigs Fly",
    description: "Complete 10 albums from the same artist (highly unlikely!)",
    category: "social",
    tier: "silver",
    iconName: "Pig",
    requirement: { type: "same_artist_completion", target: 10 } as TrophyRequirement,
  },
];

export class TrophyService {
  // Initialize trophies in database
  async initializeTrophies(): Promise<void> {
    console.log("Initializing trophies...");
    
    for (const trophyDef of TROPHY_DEFINITIONS) {
      const existing = await db
        .select()
        .from(trophies)
        .where(and(
          eq(trophies.name, trophyDef.name),
          eq(trophies.category, trophyDef.category)
        ))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(trophies).values([trophyDef]);
        console.log(`Created trophy: ${trophyDef.name}`);
      }
    }
    
    console.log("Trophy initialization complete!");
  }

  // Check and award trophies for a specific user
  async checkAndAwardTrophies(userId: string): Promise<UserTrophy[]> {
    const newTrophies: UserTrophy[] = [];
    
    // Get all active trophies that user hasn't earned yet
    const availableTrophies = await db
      .select()
      .from(trophies)
      .where(eq(trophies.isActive, true));

    const userEarnedTrophies = await db
      .select({ trophyId: userTrophies.trophyId })
      .from(userTrophies)
      .where(eq(userTrophies.userId, userId));

    const earnedTrophyIds = new Set(userEarnedTrophies.map(ut => ut.trophyId));
    const unearnedTrophies = availableTrophies.filter(t => !earnedTrophyIds.has(t.id));

    // Get user stats for trophy checking
    const userStats = await this.getUserStats(userId);

    for (const trophy of unearnedTrophies) {
      const meetsRequirement = await this.checkTrophyRequirement(userId, trophy, userStats);
      
      if (meetsRequirement) {
        const [newTrophy] = await db
          .insert(userTrophies)
          .values([{
            userId,
            trophyId: trophy.id,
            progress: trophy.requirement.target,
          }])
          .returning();
        
        newTrophies.push(newTrophy);
        console.log(`Awarded trophy "${trophy.name}" to user ${userId}`);
      }
    }

    return newTrophies;
  }

  // Get user statistics for trophy evaluation
  private async getUserStats(userId: string) {
    const [totalSpinsResult] = await db
      .select({ count: count() })
      .from(spins)
      .where(eq(spins.userId, userId));

    const [listenedSpinsResult] = await db
      .select({ count: count() })
      .from(spins)
      .where(and(
        eq(spins.userId, userId),
        sql`${spins.listenedAt} IS NOT NULL`
      ));

    const [userStreak] = await db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, userId));

    // Get unique genres from user's spins
    const genreResults = await db
      .select({ genres: sql`DISTINCT jsonb_array_elements_text(albums.genres)` })
      .from(spins)
      .innerJoin(albums, eq(spins.albumId, albums.id))
      .where(eq(spins.userId, userId));

    // Count discovery modes
    const modeResults = await db
      .select({ 
        mode: spins.mode,
        count: count()
      })
      .from(spins)
      .where(eq(spins.userId, userId))
      .groupBy(spins.mode);

    const discoveryModes: Record<string, number> = {};
    modeResults.forEach(r => {
      discoveryModes[r.mode] = r.count;
    });

    return {
      totalSpins: totalSpinsResult.count,
      listenedSpins: listenedSpinsResult.count,
      currentStreak: userStreak?.current || 0,
      longestStreak: userStreak?.longest || 0,
      uniqueGenres: genreResults.length,
      discoveryModes,
    };
  }

  // Check if user meets trophy requirement
  private async checkTrophyRequirement(userId: string, trophy: Trophy, userStats: any): Promise<boolean> {
    const { type, target, metadata } = trophy.requirement;

    switch (type) {
      case 'total_spins':
        return userStats.totalSpins >= target;
      
      case 'listened_spins':
        return userStats.listenedSpins >= target;
      
      case 'current_streak':
        return userStats.currentStreak >= target;
      
      case 'longest_streak':
        return userStats.longestStreak >= target;
      
      case 'unique_genres':
        return userStats.uniqueGenres >= target;
      
      case 'discovery_mode':
        if (metadata?.mode) {
          return (userStats.discoveryModes[metadata.mode] || 0) >= target;
        }
        return false;
      
      default:
        return false;
    }
  }

  // Get user's trophies with trophy details
  async getUserTrophies(userId: string) {
    return await db
      .select()
      .from(userTrophies)
      .innerJoin(trophies, eq(userTrophies.trophyId, trophies.id))
      .where(eq(userTrophies.userId, userId))
      .orderBy(desc(userTrophies.earnedAt));
  }

  // Get all trophies with user progress
  async getTrophiesWithProgress(userId: string) {
    const allTrophies = await db
      .select()
      .from(trophies)
      .where(eq(trophies.isActive, true))
      .orderBy(trophies.category, trophies.tier);

    const userTrophiesMap = new Map();
    const earnedTrophies = await db
      .select()
      .from(userTrophies)
      .where(eq(userTrophies.userId, userId));

    earnedTrophies.forEach(ut => {
      userTrophiesMap.set(ut.trophyId, ut);
    });

    return allTrophies.map(trophy => ({
      ...trophy,
      userTrophy: userTrophiesMap.get(trophy.id) || null,
    }));
  }
}

export const trophyService = new TrophyService();