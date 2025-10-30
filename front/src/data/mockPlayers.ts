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
    ] : undefined,
  achievements: [
    {
        "roleId": "mayor",
        "level": 9,
        "points": 350,
        "pointsNextLevel": 350,
        "category": "EASY"
    },
    {
        "roleId": "baker",
        "level": 9,
        "points": 350,
        "pointsNextLevel": 350,
        "category": "EASY"
    },
    {
        "roleId": "aura-seer",
        "level": 9,
        "points": 350,
        "pointsNextLevel": 350,
        "category": "EASY"
    },
    {
        "roleId": "tough-guy",
        "level": 9,
        "points": 350,
        "pointsNextLevel": 350,
        "category": "EASY"
    },
    {
        "roleId": "ghost-lady",
        "level": 9,
        "points": 350,
        "pointsNextLevel": 350,
        "category": "EASY"
    },
    {
        "roleId": "bodyguard",
        "level": 9,
        "points": 350,
        "pointsNextLevel": 350,
        "category": "EASY"
    },
    {
        "roleId": "vigilante",
        "level": 9,
        "points": 350,
        "pointsNextLevel": 350,
        "category": "EASY"
    },
    {
        "roleId": "medium",
        "level": 9,
        "points": 350,
        "pointsNextLevel": 350,
        "category": "EASY"
    },
    {
        "roleId": "doctor",
        "level": 9,
        "points": 350,
        "pointsNextLevel": 350,
        "category": "EASY"
    },
    {
        "roleId": "wolf-seer",
        "level": 9,
        "points": 150,
        "pointsNextLevel": 150,
        "category": "NORMAL"
    },
    {
        "roleId": "headhunter",
        "level": 9,
        "points": 150,
        "pointsNextLevel": 150,
        "category": "NORMAL"
    },
    {
        "roleId": "lovers",
        "level": 9,
        "points": 150,
        "pointsNextLevel": 150,
        "category": "NORMAL"
    },
    {
        "roleId": "junior-werewolf",
        "level": 9,
        "points": 150,
        "pointsNextLevel": 150,
        "category": "NORMAL"
    },
    {
        "roleId": "warden",
        "level": 8,
        "points": 349,
        "pointsNextLevel": 350,
        "category": "EASY"
    },
    {
        "roleId": "beast-hunter",
        "level": 8,
        "points": 255,
        "pointsNextLevel": 350,
        "category": "EASY"
    },
    {
        "roleId": "priest",
        "level": 8,
        "points": 251,
        "pointsNextLevel": 350,
        "category": "EASY"
    },
    {
        "roleId": "flower-child",
        "level": 7,
        "points": 232,
        "pointsNextLevel": 250,
        "category": "EASY"
    },
    {
        "roleId": "ritualist",
        "level": 7,
        "points": 217,
        "pointsNextLevel": 250,
        "category": "EASY"
    },
    {
        "roleId": "gunner",
        "level": 7,
        "points": 215,
        "pointsNextLevel": 250,
        "category": "EASY"
    },
    {
        "roleId": "harlot",
        "level": 7,
        "points": 212,
        "pointsNextLevel": 250,
        "category": "EASY"
    },
    {
        "roleId": "grave-robber",
        "level": 7,
        "points": 209,
        "pointsNextLevel": 250,
        "category": "EASY"
    },
    {
        "roleId": "accomplice",
        "level": 7,
        "points": 27,
        "pointsNextLevel": 30,
        "category": "HARD"
    },
    {
        "roleId": "detective",
        "level": 6,
        "points": 187,
        "pointsNextLevel": 200,
        "category": "EASY"
    },
    {
        "roleId": "jailer",
        "level": 6,
        "points": 167,
        "pointsNextLevel": 200,
        "category": "EASY"
    },
    {
        "roleId": "seer",
        "level": 6,
        "points": 163,
        "pointsNextLevel": 200,
        "category": "EASY"
    },
    {
        "roleId": "stubborn-werewolf",
        "level": 6,
        "points": 87,
        "pointsNextLevel": 100,
        "category": "NORMAL"
    },
    {
        "roleId": "shadow-wolf",
        "level": 6,
        "points": 86,
        "pointsNextLevel": 100,
        "category": "NORMAL"
    },
    {
        "roleId": "corruptor",
        "level": 6,
        "points": 23,
        "pointsNextLevel": 25,
        "category": "HARD"
    },
    {
        "roleId": "loudmouth",
        "level": 5,
        "points": 145,
        "pointsNextLevel": 150,
        "category": "EASY"
    },
    {
        "roleId": "spirit-seer",
        "level": 5,
        "points": 144,
        "pointsNextLevel": 150,
        "category": "EASY"
    },
    {
        "roleId": "mortician",
        "level": 5,
        "points": 143,
        "pointsNextLevel": 150,
        "category": "EASY"
    },
    {
        "roleId": "analyst",
        "level": 5,
        "points": 140,
        "pointsNextLevel": 150,
        "category": "EASY"
    },
    {
        "roleId": "cursed-human",
        "level": 5,
        "points": 134,
        "pointsNextLevel": 150,
        "category": "EASY"
    },
    {
        "roleId": "astronomer",
        "level": 5,
        "points": 130,
        "pointsNextLevel": 150,
        "category": "EASY"
    },
    {
        "roleId": "witch",
        "level": 5,
        "points": 100,
        "pointsNextLevel": 150,
        "category": "EASY"
    },
    {
        "roleId": "alpha-werewolf",
        "level": 5,
        "points": 61,
        "pointsNextLevel": 75,
        "category": "NORMAL"
    },
    {
        "roleId": "guardian-wolf",
        "level": 5,
        "points": 60,
        "pointsNextLevel": 75,
        "category": "NORMAL"
    },
    {
        "roleId": "wolf-shaman",
        "level": 5,
        "points": 55,
        "pointsNextLevel": 75,
        "category": "NORMAL"
    },
    {
        "roleId": "cupid",
        "level": 4,
        "points": 98,
        "pointsNextLevel": 100,
        "category": "EASY"
    },
    {
        "roleId": "avenger",
        "level": 4,
        "points": 93,
        "pointsNextLevel": 100,
        "category": "EASY"
    },
    {
        "roleId": "flagger",
        "level": 4,
        "points": 90,
        "pointsNextLevel": 100,
        "category": "EASY"
    },
    {
        "roleId": "pacifist",
        "level": 4,
        "points": 78,
        "pointsNextLevel": 100,
        "category": "EASY"
    },
    {
        "roleId": "sheriff",
        "level": 4,
        "points": 69,
        "pointsNextLevel": 100,
        "category": "EASY"
    },
    {
        "roleId": "fool",
        "level": 4,
        "points": 42,
        "pointsNextLevel": 50,
        "category": "NORMAL"
    },
    {
        "roleId": "werewolf-berserk",
        "level": 4,
        "points": 36,
        "pointsNextLevel": 50,
        "category": "NORMAL"
    },
    {
        "roleId": "voodoo-werewolf",
        "level": 4,
        "points": 33,
        "pointsNextLevel": 50,
        "category": "NORMAL"
    },
    {
        "roleId": "nightmare-werewolf",
        "level": 4,
        "points": 29,
        "pointsNextLevel": 50,
        "category": "NORMAL"
    },
    {
        "roleId": "sect-member",
        "level": 4,
        "points": 27,
        "pointsNextLevel": 50,
        "category": "NORMAL"
    },
    {
        "roleId": "alchemist",
        "level": 4,
        "points": 13,
        "pointsNextLevel": 16,
        "category": "HARD"
    },
    {
        "roleId": "seer-apprentice",
        "level": 3,
        "points": 43,
        "pointsNextLevel": 50,
        "category": "EASY"
    },
    {
        "roleId": "conjuror",
        "level": 3,
        "points": 43,
        "pointsNextLevel": 50,
        "category": "EASY"
    },
    {
        "roleId": "bellringer",
        "level": 3,
        "points": 42,
        "pointsNextLevel": 50,
        "category": "EASY"
    },
    {
        "roleId": "serial-killer",
        "level": 3,
        "points": 12,
        "pointsNextLevel": 13,
        "category": "HARD"
    },
    {
        "roleId": "soulbinder",
        "level": 2,
        "points": 39,
        "pointsNextLevel": 40,
        "category": "EASY"
    },
    {
        "roleId": "butcher",
        "level": 2,
        "points": 37,
        "pointsNextLevel": 40,
        "category": "EASY"
    },
    {
        "roleId": "violinist",
        "level": 2,
        "points": 30,
        "pointsNextLevel": 40,
        "category": "EASY"
    },
    {
        "roleId": "arsonist",
        "level": 2,
        "points": 8,
        "pointsNextLevel": 10,
        "category": "HARD"
    },
    {
        "roleId": "fortune-teller",
        "level": 1,
        "points": 29,
        "pointsNextLevel": 30,
        "category": "EASY"
    },
    {
        "roleId": "night-watchman",
        "level": 1,
        "points": 26,
        "pointsNextLevel": 30,
        "category": "EASY"
    },
    {
        "roleId": "grumpy-grandma",
        "level": 1,
        "points": 23,
        "pointsNextLevel": 30,
        "category": "EASY"
    },
    {
        "roleId": "villager",
        "level": 0,
        "points": 17,
        "pointsNextLevel": 20,
        "category": "EASY"
    },
    {
        "roleId": "judge",
        "level": 0,
        "points": 14,
        "pointsNextLevel": 20,
        "category": "EASY"
    },
    {
        "roleId": "pumpkin-king",
        "level": 0,
        "points": 14,
        "pointsNextLevel": 20,
        "category": "EASY"
    },
    {
        "roleId": "preacher",
        "level": 0,
        "points": 12,
        "pointsNextLevel": 20,
        "category": "EASY"
    },
    {
        "roleId": "gambler",
        "level": 0,
        "points": 10,
        "pointsNextLevel": 20,
        "category": "EASY"
    },
    {
        "roleId": "forger",
        "level": 0,
        "points": 10,
        "pointsNextLevel": 20,
        "category": "EASY"
    },
    {
        "roleId": "recruit",
        "level": 0,
        "points": 8,
        "pointsNextLevel": 10,
        "category": "NORMAL"
    },
    {
        "roleId": "bandit",
        "level": 0,
        "points": 3,
        "pointsNextLevel": 4,
        "category": "HARD"
    }
  ]
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