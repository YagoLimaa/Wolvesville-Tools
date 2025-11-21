import express from 'express';
import axios from 'axios';
import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/sharedAvatarId/:playerId/:slotNumber', asyncHandler(async (req, res) => {
  const { playerId, slotNumber } = req.params;
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/avatars/sharedAvatarId/${playerId}/${slotNumber}`;
  const response = await axios.get(requestUrl, req.requestConfig);
  res.send(response.data);
}));

router.get('/:sharedAvatarId', asyncHandler(async (req, res) => {
  const { sharedAvatarId } = req.params;
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/avatars/${sharedAvatarId}`;
  const response = await axios.get(requestUrl, req.requestConfig);
  res.json(response.data);
}));

export default router;