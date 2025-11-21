import express from 'express';
import axios from 'axios';
import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/season', asyncHandler(async (req, res) => {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/season`;
  const response = await axios.get(requestUrl, req.requestConfig);
  const seasonData = response.data;

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
  const rosesResponse = await axios.get(rosesUrl, req.requestConfig);
  const roses = rosesResponse.data;

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
    for (const skin of roses) {
      if (skin.id === 'U0s') {
        currencyIcons.ROSES.SERVER_ROSE = skin.imageUrl;
      } else if (skin.id === 'mkQ') {
        currencyIcons.ROSES.SINGLE_ROSE = skin.imageUrl;
      }
    }
  }

  const responseData = {
    ...seasonData,
    currencyTotals,
    currencyIcons,
  };

  res.json(responseData);
}));

router.get('/shop', asyncHandler(async (req, res) => {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/shop`;
  const response = await axios.get(requestUrl, req.requestConfig);
  res.json(response.data);
}));

router.get('/challenges', asyncHandler(async (req, res) => {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/challenges`;
  const requestConfig = {
    ...req.requestConfig,
    params: {
      locale: req.query.locale || 'en'
    }
  };
  const response = await axios.get(requestUrl, requestConfig);
  res.json(response.data);
}));

export default router;