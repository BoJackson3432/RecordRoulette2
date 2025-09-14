import { users, albums, spins, streaks, favorites, type User, type InsertUser, type Album, type InsertAlbum, type Spin, type InsertSpin, type Streak, type InsertStreak, type SpinWithAlbum, type UserWithStreak, type Favorite, type InsertFavorite } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByProviderId(providerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  getUserWithStreak(id: string): Promise<UserWithStreak | undefined>;

  // Album operations
  getAlbum(id: string): Promise<Album | undefined>;
  upsertAlbum(album: InsertAlbum): Promise<Album>;

  // Spin operations
  createSpin(spin: InsertSpin): Promise<Spin>;
  getSpin(id: string): Promise<SpinWithAlbum | undefined>;
  getSpinsByUser(userId: string, limit?: number): Promise<SpinWithAlbum[]>;
  getSpinsByUserSince(userId: string, since: Date): Promise<SpinWithAlbum[]>;
  getRecentSpinsByUser(userId: string, days: number): Promise<Spin[]>;
  updateSpin(id: string, data: Partial<Spin>): Promise<Spin>;

  // Streak operations
  getStreak(userId: string): Promise<Streak | undefined>;
  upsertStreak(streak: InsertStreak): Promise<Streak>;

  // Favorites operations
  getFavoritesByUser(userId: string): Promise<(Favorite & { album: Album })[]>;
  addFavorite(userId: string, albumId: string): Promise<Favorite>;
  removeFavorite(userId: string, albumId: string): Promise<void>;
  isFavorite(userId: string, albumId: string): Promise<boolean>;
  batchCheckFavorites(userId: string, albumIds: string[]): Promise<Record<string, boolean>>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByProviderId(providerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.providerId, providerId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
  }

  async getUserWithStreak(id: string): Promise<UserWithStreak | undefined> {
    const [result] = await db
      .select()
      .from(users)
      .leftJoin(streaks, eq(users.id, streaks.userId))
      .where(eq(users.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.users,
      streak: result.streaks || null,
    };
  }

  async getAlbum(id: string): Promise<Album | undefined> {
    const [album] = await db.select().from(albums).where(eq(albums.id, id));
    return album || undefined;
  }

  async upsertAlbum(album: InsertAlbum): Promise<Album> {
    // Ensure genres is a proper string array
    const albumData = {
      ...album,
      genres: Array.isArray(album.genres) ? album.genres.filter((g): g is string => typeof g === 'string') : [],
    };
    
    const [result] = await db
      .insert(albums)
      .values(albumData)
      .onConflictDoUpdate({
        target: albums.id,
        set: albumData,
      })
      .returning();
    return result;
  }

  async createSpin(spin: InsertSpin): Promise<Spin> {
    const [result] = await db.insert(spins).values(spin).returning();
    return result;
  }

  async getSpin(id: string): Promise<SpinWithAlbum | undefined> {
    const [result] = await db
      .select()
      .from(spins)
      .innerJoin(albums, eq(spins.albumId, albums.id))
      .where(eq(spins.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.spins,
      album: result.albums,
    };
  }

  async getSpinsByUser(userId: string, limit: number = 10): Promise<SpinWithAlbum[]> {
    const results = await db
      .select()
      .from(spins)
      .innerJoin(albums, eq(spins.albumId, albums.id))
      .where(eq(spins.userId, userId))
      .orderBy(desc(spins.startedAt))
      .limit(limit);

    return results.map(result => ({
      ...result.spins,
      album: result.albums,
    }));
  }

  async getSpinsByUserSince(userId: string, since: Date): Promise<SpinWithAlbum[]> {
    const results = await db
      .select()
      .from(spins)
      .innerJoin(albums, eq(spins.albumId, albums.id))
      .where(and(eq(spins.userId, userId), gte(spins.startedAt, since)))
      .orderBy(desc(spins.startedAt));

    return results.map(result => ({
      ...result.spins,
      album: result.albums,
    }));
  }

  async getRecentSpinsByUser(userId: string, days: number): Promise<Spin[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return db
      .select()
      .from(spins)
      .where(and(eq(spins.userId, userId), gte(spins.startedAt, cutoff)));
  }

  async updateSpin(id: string, data: Partial<Spin>): Promise<Spin> {
    const [result] = await db.update(spins).set(data).where(eq(spins.id, id)).returning();
    return result;
  }

  async getStreak(userId: string): Promise<Streak | undefined> {
    const [streak] = await db.select().from(streaks).where(eq(streaks.userId, userId));
    return streak || undefined;
  }

  async upsertStreak(streak: InsertStreak): Promise<Streak> {
    const [result] = await db
      .insert(streaks)
      .values(streak)
      .onConflictDoUpdate({
        target: streaks.userId,
        set: streak,
      })
      .returning();
    return result;
  }

  async getFavoritesByUser(userId: string): Promise<(Favorite & { album: Album })[]> {
    const results = await db
      .select()
      .from(favorites)
      .innerJoin(albums, eq(favorites.albumId, albums.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

    return results.map(result => ({
      ...result.favorites,
      album: result.albums,
    }));
  }

  async addFavorite(userId: string, albumId: string): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({ userId, albumId })
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, albumId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.albumId, albumId)));
  }

  async isFavorite(userId: string, albumId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.albumId, albumId)));
    return !!result;
  }

  async batchCheckFavorites(userId: string, albumIds: string[]): Promise<Record<string, boolean>> {
    if (albumIds.length === 0) return {};
    
    const results = await db
      .select({ albumId: favorites.albumId })
      .from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        inArray(favorites.albumId, albumIds)
      ));
    
    const favoriteSet = new Set(results.map(r => r.albumId));
    return albumIds.reduce((acc, albumId) => {
      acc[albumId] = favoriteSet.has(albumId);
      return acc;
    }, {} as Record<string, boolean>);
  }
}

export const storage = new DatabaseStorage();
