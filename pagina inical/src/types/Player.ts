export interface Player {
  id: string;
  username: string;
  level: number;
  status: string;
  clan?: {
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
  };
  receivedRosesCount: number;
  sentRosesCount: number;
  personalMessage?: string;
}

export interface SearchResult {
  players: Player[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasPages: boolean;
    prevPage?: number;
    nextPage?: number;
  };
}