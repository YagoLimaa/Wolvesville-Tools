export async function handleBattlePassSeason(requestConfig, WOLVESVILLE_API_BASE_URL) {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/season`;
  const response = await fetch(requestUrl, requestConfig);
  const seasonData = await response.json();

  const currencyTotals = {
    GOLD: 0,
    SINGLE_ROSE: 0,
    SERVER_ROSE: 0,
    BATTLE_PASS_COIN: 0,
    GEM: 0,
  };

  seasonData.rewards.forEach(reward => {
    if (reward.type === 'GOLD') {
      currencyTotals.GOLD += reward.amount;
    } else if (reward.type === 'BATTLE_PASS_COIN') {
      currencyTotals.BATTLE_PASS_COIN += reward.amount;
    } else if (reward.type === 'GEM') {
      currencyTotals.GEM += reward.amount;
    } else if (reward.type === 'ROSE_PACKAGE') {
      if (reward.rosePackageId === 'U0s') {
        currencyTotals.SERVER_ROSE += reward.amount;
      } else if (reward.rosePackageId === 'mkQ') {
        currencyTotals.SINGLE_ROSE += reward.amount;
      }
    }
  });

  const rosesUrl = `${WOLVESVILLE_API_BASE_URL}/items/roses`;
  const rosesResponse = await fetch(rosesUrl, requestConfig);
  const roses = await rosesResponse.json();

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

  return {
    ...seasonData,
    currencyTotals,
    currencyIcons,
  };
}

export async function handleBattlePassShop(requestConfig, WOLVESVILLE_API_BASE_URL) {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/shop`;
  const response = await fetch(requestUrl, requestConfig);
  const responseData = await response.json();
  return responseData;
}

export async function handleBattlePassChallenges(searchParams, requestConfig, WOLVESVILLE_API_BASE_URL) {
  const locale = searchParams.get('locale') || 'en';
  const requestUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/battlePass/challenges`);
  requestUrl.searchParams.append('locale', locale);
  
  const response = await fetch(requestUrl.toString(), requestConfig);
  const responseData = await response.json();
  return responseData;
}
