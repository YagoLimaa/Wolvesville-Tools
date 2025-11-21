import express from 'express';
import axios from 'axios';
import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/activeOffers', asyncHandler(async (req, res) => {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/shop/activeOffers`;
  const response = await axios.get(requestUrl, req.requestConfig);
  res.json(response.data);
}));

export default router;