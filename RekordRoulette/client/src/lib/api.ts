import { apiRequest } from "./queryClient";

export interface Album {
  id: string;
  name: string;
  artist: string;
  year: number | null;
  coverUrl: string | null;
  deepLink: string;
}

export interface SpinResponse {
  spinId: string;
  album: Album;
  mode: string;
}

export interface SpinDetails {
  id: string;
  mode: string;
  startedAt: string;
  listenedAt: string | null;
  album: Album;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  onboardingCompleted?: boolean;
  streak: {
    current: number;
    longest: number;
  };
}

export interface SpinHistory {
  id: string;
  startedAt: string;
  listenedAt: string | null;
  album: Album;
}

export const api = {
  // Auth
  async getProfile(): Promise<UserProfile> {
    const res = await apiRequest("GET", "/api/me");
    return res.json();
  },

  async logout(): Promise<void> {
    await apiRequest("GET", "/auth/logout");
  },

  getSpotifyLoginUrl(): string {
    // Use different routes for development vs production
    return import.meta.env.DEV ? "/auth/spotify/login" : "/api/auth/spotify/login";
  },

  // Spins
  async createSpin(mode: string = "saved"): Promise<SpinResponse> {
    const res = await apiRequest("POST", "/api/spin", { mode });
    return res.json();
  },

  async getSpin(spinId: string): Promise<SpinDetails> {
    const res = await apiRequest("GET", `/api/spins/${spinId}`);
    return res.json();
  },

  async markListened(spinId: string): Promise<{ ok: boolean; streak: { current: number; longest: number } }> {
    const res = await apiRequest("POST", "/api/listened", { spinId });
    return res.json();
  },

  async generateShareImage(spinId: string): Promise<Blob> {
    const res = await apiRequest("POST", "/api/share", { spinId });
    return res.blob();
  },

  // Profile
  async getSpinHistory(): Promise<SpinHistory[]> {
    const res = await apiRequest("GET", "/api/profile/spins");
    return res.json();
  },

  // Spotify playback
  async playAlbum(albumId: string): Promise<{
    success: boolean;
    message: string;
    requiresDevice?: boolean;
    spotifyUrl?: string;
    playbackMethod?: string;
  }> {
    const res = await apiRequest("POST", `/api/spotify/play/${albumId}`);
    return res.json();
  },

};
