import express from 'express';
import axios from 'axios';
import { VALID_ITEM_CATEGORIES, WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { processItems, parseItemsArray } from '../utils/itemProcessor.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/tags', asyncHandler(async (req, res) => {
  const { season } = req.query;

  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/tags`;
  const response = await axios.get(requestUrl, req.requestConfig);
  let tagsData = response.data;

  if (season) {
    const seasonTag = `origin:battle_pass:season_${season}`;
    tagsData = tagsData.filter(item => item.tags && item.tags.includes(seasonTag));
  }

  res.json(tagsData);
}));

router.get('/:category', asyncHandler(async (req, res) => {
  const { category } = req.params;

  if (!VALID_ITEM_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Categoria de item inválida.' });
  }

  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/${category}`;
  const response = await axios.get(requestUrl, req.requestConfig);

  if (category === 'tags') {
    return res.json(response.data);
  }

  const itemsArray = parseItemsArray(response.data);
  const processedItems = processItems(itemsArray);

  res.json(processedItems);
}));

export default router;