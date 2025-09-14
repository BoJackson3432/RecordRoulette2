import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull().default("spotify"),
  providerId: text("provider_id").notNull().unique(),
  displayName: text("display_name"),
  email: text("email").unique(),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpires: timestamp("token_expires"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  // Enhanced user fields for premium features and social functionality
  premiumTier: text("premium_tier").default("free"), // 'free', 'premium', 'pro'
  referralCode: text("referral_code").unique(),
  totalReferrals: integer("total_referrals").notNull().default(0),
  customTheme: text("custom_theme"),
  isVerifiedCurator: boolean("is_verified_curator").notNull().default(false),
  dailySpinLimit: integer("daily_spin_limit").notNull().default(5),
  keyboardShortcuts: boolean("keyboard_shortcuts").notNull().default(false),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const albums = pgTable("albums", {
  id: text("id").primaryKey(), // spotify album id
  provider: text("provider").notNull().default("spotify"),
  name: text("name").notNull(),
  artist: text("artist").notNull(),
  year: integer("year"),
  coverUrl: text("cover_url"),
  previewUrl: text("preview_url"), // 30-second preview URL from Spotify
  genres: jsonb("genres").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const spins = pgTable("spins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mode: text("mode").notNull().default("personal"),
  seed: text("seed"),
  albumId: text("album_id").notNull().references(() => albums.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  listenedAt: timestamp("listened_at"),
  shareImage: text("share_image"),
});

export const streaks = pgTable("streaks", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  current: integer("current").notNull().default(0),
  longest: integer("longest").notNull().default(0),
  lastSpinDate: timestamp("last_spin_date"),
});

// Trophy system
export const trophies = pgTable("trophies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'discovery', 'streak', 'genre', 'social'
  tier: text("tier").notNull(), // 'bronze', 'silver', 'gold', 'diamond'
  iconName: text("icon_name").notNull(),
  requirement: jsonb("requirement").$type<{
    type: string;
    target: number;
    timeframe?: string;
    metadata?: Record<string, any>;
  }>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userTrophies = pgTable("user_trophies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  trophyId: varchar("trophy_id").notNull().references(() => trophies.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  progress: integer("progress").default(0),
});

// Challenge system
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'daily', 'weekly', 'monthly'
  category: text("category").notNull(), // 'discovery', 'genre', 'streak', 'social'
  requirement: jsonb("requirement").$type<{
    type: string;
    target: number;
    metadata?: Record<string, any>;
  }>().notNull(),
  reward: jsonb("reward").$type<{
    type: string;
    value: number;
    metadata?: Record<string, any>;
  }>().notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userChallengeProgress = pgTable("user_challenge_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Weekly statistics and recap
export const weeklyStats = pgTable("weekly_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  totalSpins: integer("total_spins").notNull().default(0),
  listenedSpins: integer("listened_spins").notNull().default(0),
  uniqueArtists: integer("unique_artists").notNull().default(0),
  uniqueGenres: integer("unique_genres").notNull().default(0),
  discoveryModes: jsonb("discovery_modes").$type<Record<string, number>>().default({}),
  genres: jsonb("genres").$type<Record<string, number>>().default({}),
  topAlbums: jsonb("top_albums").$type<Array<{id: string; name: string; artist: string; coverUrl?: string}>>().default([]),
  streakDays: integer("streak_days").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Leaderboards
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: text("category").notNull(), // 'current_streak', 'longest_streak', 'total_spins', 'weekly_discoveries', 'genre_diversity'
  timeframe: text("timeframe").notNull(), // 'daily', 'weekly', 'monthly', 'all_time'
  value: integer("value").notNull(),
  rank: integer("rank"),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Favorites system
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  albumId: text("album_id").notNull().references(() => albums.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userAlbumUnique: unique().on(table.userId, table.albumId),
}));

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  spins: many(spins),
  streak: one(streaks),
  trophies: many(userTrophies),
  challengeProgress: many(userChallengeProgress),
  weeklyStats: many(weeklyStats),
  leaderboardEntries: many(leaderboardEntries),
  favorites: many(favorites),
  // New relations
  referralCodes: many(referralCodes),
  referralsMade: many(referrals, { relationName: "referrerRelation" }),
  referralsReceived: many(referrals, { relationName: "refereeRelation" }),
  subscription: one(userSubscriptions),
  moodPreferences: many(userMoodPreferences),
  friendshipsRequested: many(friendships, { relationName: "requesterRelation" }),
  friendshipsAddressed: many(friendships, { relationName: "addresseeRelation" }),
  challengesSent: many(albumChallenges, { relationName: "fromUserRelation" }),
  challengesReceived: many(albumChallenges, { relationName: "toUserRelation" }),
  discoveryJournals: many(discoveryJournals),
  behaviorEvents: many(userBehaviorEvents),
  notificationSettings: one(pushNotificationSettings),
  rewards: many(userRewards),
}));

export const albumsRelations = relations(albums, ({ many }) => ({
  spins: many(spins),
  favorites: many(favorites),
}));

export const spinsRelations = relations(spins, ({ one }) => ({
  user: one(users, { fields: [spins.userId], references: [users.id] }),
  album: one(albums, { fields: [spins.albumId], references: [albums.id] }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, { fields: [streaks.userId], references: [users.id] }),
}));

export const trophiesRelations = relations(trophies, ({ many }) => ({
  userTrophies: many(userTrophies),
}));

export const userTrophiesRelations = relations(userTrophies, ({ one }) => ({
  user: one(users, { fields: [userTrophies.userId], references: [users.id] }),
  trophy: one(trophies, { fields: [userTrophies.trophyId], references: [trophies.id] }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  userProgress: many(userChallengeProgress),
}));

export const userChallengeProgressRelations = relations(userChallengeProgress, ({ one }) => ({
  user: one(users, { fields: [userChallengeProgress.userId], references: [users.id] }),
  challenge: one(challenges, { fields: [userChallengeProgress.challengeId], references: [challenges.id] }),
}));

export const weeklyStatsRelations = relations(weeklyStats, ({ one }) => ({
  user: one(users, { fields: [weeklyStats.userId], references: [users.id] }),
}));

export const leaderboardEntriesRelations = relations(leaderboardEntries, ({ one }) => ({
  user: one(users, { fields: [leaderboardEntries.userId], references: [users.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  album: one(albums, { fields: [favorites.albumId], references: [albums.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAlbumSchema = createInsertSchema(albums).omit({
  createdAt: true,
});

export const insertSpinSchema = createInsertSchema(spins).omit({
  id: true,
  startedAt: true,
});

export const insertStreakSchema = createInsertSchema(streaks);
export const insertTrophySchema = createInsertSchema(trophies).omit({ id: true, createdAt: true });
export const insertUserTrophySchema = createInsertSchema(userTrophies).omit({ id: true, earnedAt: true });
export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true, createdAt: true });
export const insertUserChallengeProgressSchema = createInsertSchema(userChallengeProgress).omit({ id: true, updatedAt: true });
export const insertWeeklyStatsSchema = createInsertSchema(weeklyStats).omit({ id: true, createdAt: true });
export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({ id: true, updatedAt: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;
export type InsertSpin = z.infer<typeof insertSpinSchema>;
export type InsertStreak = z.infer<typeof insertStreakSchema>;
export type InsertTrophy = z.infer<typeof insertTrophySchema>;
export type InsertUserTrophy = z.infer<typeof insertUserTrophySchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type InsertUserChallengeProgress = z.infer<typeof insertUserChallengeProgressSchema>;
export type InsertWeeklyStats = z.infer<typeof insertWeeklyStatsSchema>;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type User = typeof users.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type Spin = typeof spins.$inferSelect;
export type Streak = typeof streaks.$inferSelect;
export type Trophy = typeof trophies.$inferSelect;
export type UserTrophy = typeof userTrophies.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;
export type WeeklyStats = typeof weeklyStats.$inferSelect;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;

// Referral system
export const referralCodes = pgTable("referral_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  code: text("code").notNull().unique(),
  uses: integer("uses").notNull().default(0),
  maxUses: integer("max_uses"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  refereeId: varchar("referee_id").notNull().references(() => users.id),
  codeUsed: text("code_used").notNull(),
  rewardClaimed: boolean("reward_claimed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Premium features
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  plan: text("plan").notNull(), // 'free', 'premium', 'pro'
  status: text("status").notNull(), // 'active', 'inactive', 'cancelled'
  features: jsonb("features").$type<string[]>().default([]),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mood-based discovery
export const moods = pgTable("moods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  description: text("description"),
  color: text("color").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const albumMoods = pgTable("album_moods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  albumId: text("album_id").notNull().references(() => albums.id),
  moodId: varchar("mood_id").notNull().references(() => moods.id),
  confidence: integer("confidence").notNull().default(50), // 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  albumMoodUnique: unique().on(table.albumId, table.moodId),
}));

export const userMoodPreferences = pgTable("user_mood_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moodId: varchar("mood_id").notNull().references(() => moods.id),
  preference: integer("preference").notNull().default(50), // 0-100
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userMoodUnique: unique().on(table.userId, table.moodId),
}));

// Social features
export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  addresseeId: varchar("addressee_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'declined', 'blocked'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  friendshipUnique: unique().on(table.requesterId, table.addresseeId),
}));

export const albumChallenges = pgTable("album_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  albumId: text("album_id").notNull().references(() => albums.id),
  message: text("message"),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'declined', 'completed'
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const discoveryJournals = pgTable("discovery_journals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  spinId: varchar("spin_id").notNull().references(() => spins.id),
  rating: integer("rating"), // 1-5 stars
  notes: text("notes"),
  mood: text("mood"),
  isPublic: boolean("is_public").notNull().default(false),
  photoUrl: text("photo_url"), // User-uploaded photo
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics and behavior tracking
export const userBehaviorEvents = pgTable("user_behavior_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  event: text("event").notNull(), // 'spin_created', 'album_completed', 'shared', 'favorite_added', etc.
  properties: jsonb("properties").$type<Record<string, any>>().default({}),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pushNotificationSettings = pgTable("push_notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  dailyReminder: boolean("daily_reminder").notNull().default(true),
  friendActivity: boolean("friend_activity").notNull().default(true),
  achievements: boolean("achievements").notNull().default(true),
  challenges: boolean("challenges").notNull().default(true),
  leaderboardUpdates: boolean("leaderboard_updates").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User rewards and badges
export const userRewards = pgTable("user_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'badge', 'feature_unlock', 'bonus_spins', 'custom_theme'
  rewardId: text("reward_id").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  earnedFrom: text("earned_from"), // 'referral', 'achievement', 'premium', 'social'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// Relations for new tables
export const referralCodesRelations = relations(referralCodes, ({ one, many }) => ({
  user: one(users, { fields: [referralCodes.userId], references: [users.id] }),
  referrals: many(referrals),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, { fields: [referrals.referrerId], references: [users.id], relationName: "referrerRelation" }),
  referee: one(users, { fields: [referrals.refereeId], references: [users.id], relationName: "refereeRelation" }),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, { fields: [userSubscriptions.userId], references: [users.id] }),
}));

export const moodsRelations = relations(moods, ({ many }) => ({
  albumMoods: many(albumMoods),
  userPreferences: many(userMoodPreferences),
}));

export const albumMoodsRelations = relations(albumMoods, ({ one }) => ({
  album: one(albums, { fields: [albumMoods.albumId], references: [albums.id] }),
  mood: one(moods, { fields: [albumMoods.moodId], references: [moods.id] }),
}));

export const userMoodPreferencesRelations = relations(userMoodPreferences, ({ one }) => ({
  user: one(users, { fields: [userMoodPreferences.userId], references: [users.id] }),
  mood: one(moods, { fields: [userMoodPreferences.moodId], references: [moods.id] }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, { fields: [friendships.requesterId], references: [users.id], relationName: "requesterRelation" }),
  addressee: one(users, { fields: [friendships.addresseeId], references: [users.id], relationName: "addresseeRelation" }),
}));

export const albumChallengesRelations = relations(albumChallenges, ({ one }) => ({
  fromUser: one(users, { fields: [albumChallenges.fromUserId], references: [users.id], relationName: "fromUserRelation" }),
  toUser: one(users, { fields: [albumChallenges.toUserId], references: [users.id], relationName: "toUserRelation" }),
  album: one(albums, { fields: [albumChallenges.albumId], references: [albums.id] }),
}));

export const discoveryJournalsRelations = relations(discoveryJournals, ({ one }) => ({
  user: one(users, { fields: [discoveryJournals.userId], references: [users.id] }),
  spin: one(spins, { fields: [discoveryJournals.spinId], references: [spins.id] }),
}));

export const userBehaviorEventsRelations = relations(userBehaviorEvents, ({ one }) => ({
  user: one(users, { fields: [userBehaviorEvents.userId], references: [users.id] }),
}));

export const pushNotificationSettingsRelations = relations(pushNotificationSettings, ({ one }) => ({
  user: one(users, { fields: [pushNotificationSettings.userId], references: [users.id] }),
}));

export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  user: one(users, { fields: [userRewards.userId], references: [users.id] }),
}));

// Insert schemas for new tables
export const insertReferralCodeSchema = createInsertSchema(referralCodes).omit({ id: true, createdAt: true });
export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true, createdAt: true });
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({ id: true, createdAt: true });
export const insertMoodSchema = createInsertSchema(moods).omit({ id: true, createdAt: true });
export const insertAlbumMoodSchema = createInsertSchema(albumMoods).omit({ id: true, createdAt: true });
export const insertUserMoodPreferenceSchema = createInsertSchema(userMoodPreferences).omit({ id: true, updatedAt: true });
export const insertFriendshipSchema = createInsertSchema(friendships).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAlbumChallengeSchema = createInsertSchema(albumChallenges).omit({ id: true, createdAt: true });
export const insertDiscoveryJournalSchema = createInsertSchema(discoveryJournals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserBehaviorEventSchema = createInsertSchema(userBehaviorEvents).omit({ id: true, createdAt: true });
export const insertPushNotificationSettingsSchema = createInsertSchema(pushNotificationSettings).omit({ id: true, updatedAt: true });
export const insertUserRewardSchema = createInsertSchema(userRewards).omit({ id: true, createdAt: true });

// Types for new tables
export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type InsertMood = z.infer<typeof insertMoodSchema>;
export type InsertAlbumMood = z.infer<typeof insertAlbumMoodSchema>;
export type InsertUserMoodPreference = z.infer<typeof insertUserMoodPreferenceSchema>;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type InsertAlbumChallenge = z.infer<typeof insertAlbumChallengeSchema>;
export type InsertDiscoveryJournal = z.infer<typeof insertDiscoveryJournalSchema>;
export type InsertUserBehaviorEvent = z.infer<typeof insertUserBehaviorEventSchema>;
export type InsertPushNotificationSettings = z.infer<typeof insertPushNotificationSettingsSchema>;
export type InsertUserReward = z.infer<typeof insertUserRewardSchema>;

export type ReferralCode = typeof referralCodes.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type Mood = typeof moods.$inferSelect;
export type AlbumMood = typeof albumMoods.$inferSelect;
export type UserMoodPreference = typeof userMoodPreferences.$inferSelect;
export type Friendship = typeof friendships.$inferSelect;
export type AlbumChallenge = typeof albumChallenges.$inferSelect;
export type DiscoveryJournal = typeof discoveryJournals.$inferSelect;
export type UserBehaviorEvent = typeof userBehaviorEvents.$inferSelect;
export type PushNotificationSettings = typeof pushNotificationSettings.$inferSelect;
export type UserReward = typeof userRewards.$inferSelect;

// Extended types for API responses
export type SpinWithAlbum = Spin & { album: Album };
export type UserWithStreak = User & { streak: Streak | null };
export type UserWithTrophies = User & { 
  streak: Streak | null; 
  trophies: (UserTrophy & { trophy: Trophy })[];
};
export type TrophyWithProgress = Trophy & { userTrophy?: UserTrophy };
export type ChallengeWithProgress = Challenge & { progress?: UserChallengeProgress };
export type SpinWithJournal = SpinWithAlbum & { journal?: DiscoveryJournal };
export type UserWithSubscription = User & { subscription?: UserSubscription };
export type AlbumWithMoods = Album & { moods: (AlbumMood & { mood: Mood })[] };
export type FriendWithMutualFriends = User & { mutualFriendsCount?: number };
