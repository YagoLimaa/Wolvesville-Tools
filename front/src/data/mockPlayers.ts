import { Player } from "@/types/Player";

export const generateMockPlayer = (id: string, username: string): Player => ({
  id,
  username,
  level: Math.floor(Math.random() * 100) + 1,
  status: Math.random() > 0.5 ? "Online" : "Offline",
  clan: Math.random() > 0.3 ? {
    name: ["Wolf Pack", "Moon Hunters", "Shadow Clan", "Night Runners", "Blood Moon"][
      Math.floor(Math.random() * 5)
    ]
  } : undefined,
  equippedAvatar: {
    url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=8b5cf6`
  },
  avatars: Array.from({ length: Math.floor(Math.random() * 12) + 3 }, (_, i) => ({
    url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}-${i}&backgroundColor=${
      ["8b5cf6", "ec4899", "f59e0b", "10b981", "06b6d4"][Math.floor(Math.random() * 5)]
    }`
  })),
  badgeIds: Array.from({ length: Math.floor(Math.random() * 8) + 1 }, (_, i) => `badge-${i}`),
  gameStats: {
    totalWinCount: Math.floor(Math.random() * 500) + 50,
    totalLoseCount: Math.floor(Math.random() * 300) + 20,
    totalTieCount: Math.floor(Math.random() * 50) + 5,
    villageWinCount: Math.floor(Math.random() * 200) + 25,
    werewolfWinCount: Math.floor(Math.random() * 150) + 15,
    totalPlayTimeInMinutes: Math.floor(Math.random() * 10000) + 1000
  },
  receivedRosesCount: Math.floor(Math.random() * 100) + 10,
  sentRosesCount: Math.floor(Math.random() * 80) + 5,
  personalMessage: Math.random() > 0.5 ? 
    ["Sempre jogo em equipe!", "Lobisomem favorito!", "Bora jogar galera!", "Vila para sempre!", "Estratégia é tudo!"][
      Math.floor(Math.random() * 5)
    ] : undefined
});

export const mockPlayerSearch = (query: string, page: number = 1) => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const players = Array.from({ length: 5 }, (_, i) => 
        generateMockPlayer(`${query}-${page}-${i}`, `${query}${i + 1}`)
      );
      
      resolve({
        players,
        pagination: {
          currentPage: page,
          totalPages: 3,
          hasPages: true,
          prevPage: page > 1 ? page - 1 : undefined,
          nextPage: page < 3 ? page + 1 : undefined
        }
      });
    }, 1000);
  });
};