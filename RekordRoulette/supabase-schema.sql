-- RecordRoulette Database Schema for Supabase
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'spotify',
  provider_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires TIMESTAMP,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  premium_tier TEXT DEFAULT 'free',
  referral_code TEXT UNIQUE,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  custom_theme TEXT,
  is_verified_curator BOOLEAN NOT NULL DEFAULT false,
  daily_spin_limit INTEGER NOT NULL DEFAULT 5,
  keyboard_shortcuts BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Albums table
CREATE TABLE albums (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'spotify',
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  year INTEGER,
  cover_url TEXT,
  preview_url TEXT,
  genres JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Spins table
CREATE TABLE spins (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  mode TEXT NOT NULL DEFAULT 'personal',
  seed TEXT,
  album_id TEXT NOT NULL REFERENCES albums(id),
  started_at TIMESTAMP DEFAULT NOW() NOT NULL,
  listened_at TIMESTAMP,
  share_image TEXT
);

-- Streaks table
CREATE TABLE streaks (
  user_id VARCHAR PRIMARY KEY REFERENCES users(id),
  current INTEGER NOT NULL DEFAULT 0,
  longest INTEGER NOT NULL DEFAULT 0,
  last_spin_date TIMESTAMP
);

-- Trophies table
CREATE TABLE trophies (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tier TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  requirement JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User trophies table
CREATE TABLE user_trophies (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  trophy_id VARCHAR NOT NULL REFERENCES trophies(id),
  earned_at TIMESTAMP DEFAULT NOW() NOT NULL,
  progress INTEGER DEFAULT 0
);

-- Challenges table
CREATE TABLE challenges (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement JSONB NOT NULL,
  reward JSONB NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User challenge progress table
CREATE TABLE user_challenge_progress (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  challenge_id VARCHAR NOT NULL REFERENCES challenges(id),
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Weekly stats table
CREATE TABLE weekly_stats (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  week_start TIMESTAMP NOT NULL,
  week_end TIMESTAMP NOT NULL,
  total_spins INTEGER NOT NULL DEFAULT 0,
  listened_spins INTEGER NOT NULL DEFAULT 0,
  unique_artists INTEGER NOT NULL DEFAULT 0,
  unique_genres JSONB DEFAULT '[]',
  mood_distribution JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_provider_id ON users(provider_id);
CREATE INDEX idx_spins_user_id ON spins(user_id);
CREATE INDEX idx_spins_album_id ON spins(album_id);
CREATE INDEX idx_user_trophies_user_id ON user_trophies(user_id);
CREATE INDEX idx_user_challenge_progress_user_id ON user_challenge_progress(user_id);
CREATE INDEX idx_weekly_stats_user_id ON weekly_stats(user_id);

-- Success message
SELECT 'RecordRoulette database schema created successfully!' as message;