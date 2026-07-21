export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  solarSystemName: string;
  capacitykWp: number;
  location: string;
  totalKWh: number;
  co2SavedKg: number;
  treesEquivalent: number;
  checkInStreakDays: number;
  badges: Badge[];
  isCurrentUser?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export interface UserStats {
  rank: number;
  totalKWh: number;
  co2SavedKg: number;
  treesEquivalent: number;
  totalCheckIns: number;
  streakDays: number;
  badgesCount: number;
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';
