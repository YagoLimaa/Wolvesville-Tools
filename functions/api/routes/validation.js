import express from 'express';
import { VALID_ITEM_CATEGORIES } from '../utils/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
* GET /api/validation/item-categories
* Returns all valid item categories
* Frontend uses this to validate before sending requests
*/
router.get('/item-categories', asyncHandler(async (req, res) => {
  res.json(VALID_ITEM_CATEGORIES);
}));

export default router;