export interface Player {
  id: string;
  username: string;
  level: number;
  status: string;
  clan?: {
    id: string;
    name: string;
  };
  equippedAvatar: {
    url: string;
  };
  avatars: Array<{
    url: string;
  }>;
  badgeIds: string[];
  gameStats: {
    totalWinCount: number;
    totalLoseCount: number;
    totalTieCount: number;
    villageWinCount: number;
    werewolfWinCount: number;
    totalPlayTimeInMinutes: number;
    achievements: Achievement[];
  };
  receivedRosesCount: number;
  sentRosesCount: number;
  personalMessage?: string;
}

export interface Achievement {
  roleId: string;
  level: number;
  points: number;
  pointsNextLevel: number;
  category: string;
}

export interface SearchResult {
  players: Player[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasPages: boolean;
    prevPage?: number;
    nextPage?: number;
  };
}