import { callApi } from './ApiService.js';

async function fetchRoses(request) {
  const rosesResponse = await callApi('items/roseSkins', { request });
  return rosesResponse.json();
}

function processRewards(seasonData) {
  const currencyTotals = {
    GOLD: 0,
    SINGLE_ROSE: 0,
    SERVER_ROSE: 0,
    BATTLE_PASS_COIN: 0,
    GEM: 0,
  };

  seasonData.rewards.forEach(reward => {
    switch (reward.type) {
      case 'GOLD':
        currencyTotals.GOLD += reward.amount;
        break;
      case 'BATTLE_PASS_COIN':
        currencyTotals.BATTLE_PASS_COIN += reward.amount;
        break;
      case 'GEM':
        currencyTotals.GEM += reward.amount;
        break;
      case 'ROSE_PACKAGE':
        if (reward.rosePackageId === 'U0s') {
          currencyTotals.SERVER_ROSE += reward.amount;
        } else if (reward.rosePackageId === 'mkQ') {
          currencyTotals.SINGLE_ROSE += reward.amount;
        }
        break;
    }
  });

  return currencyTotals;
}

function getCurrencyIcons(seasonData, roses) {
  const currencyIcons = {
    GOLD: "https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png",
    GEM: "https://www.wolvesville.com/static/media/gem.439d7650def0b35d6a66.png",
    BATTLE_PASS_COIN: `https://cdn2.wolvesville.com/battlePass/coins/bp${seasonData.number}_single@2x.png`,
    ROSES: {
      SERVER_ROSE: "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png",
      SINGLE_ROSE: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png"
    },
  };

  if (Array.isArray(roses)) {
    for (const rose of roses) {
      if (rose.id === 'U0s') {
        currencyIcons.ROSES.SERVER_ROSE = rose.imageUrl;
      } else if (rose.id === 'mkQ') {
        currencyIcons.ROSES.SINGLE_ROSE = rose.imageUrl;
      }
    }
  }

  return currencyIcons;
}

export async function processBattlePassSeason(seasonData, request) {
  const roses = await fetchRoses(request);
  const currencyTotals = processRewards(seasonData);
  const currencyIcons = getCurrencyIcons(seasonData, roses);

  return {
    ...seasonData,
    currencyTotals,
    currencyIcons,
  };
}