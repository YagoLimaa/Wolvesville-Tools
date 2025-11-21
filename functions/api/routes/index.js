import express from 'express';
import playersRouter from './players.js';
import rolesRouter from './roles.js';
import shopRouter from './shop.js';
import battlePassRouter from './battlePass.js';
import clansRouter from './clans.js';
import itemsRouter from './items.js';
import avatarsRouter from './avatars.js';
import announcementsRouter from './announcements.js';
import validationRouter from './validation.js';

const router = express.Router();

// Player routes
router.use('/search', playersRouter);
router.use('/players', playersRouter);

// Role routes
router.use('/roles', rolesRouter);
router.use('/roleRotations', rolesRouter);

// Shop routes
router.use('/shop', shopRouter);

// Battle Pass routes
router.use('/battlePass', battlePassRouter);

// Clan routes
router.use('/clans', clansRouter);
router.use('/clan', (req, res, next) => {
  req.baseUrl = '/api/clans';
  clansRouter(req, res, next);
});

// Item routes
router.use('/items', itemsRouter);

// Avatar routes
router.use('/avatars', avatarsRouter);

// Announcement routes
router.use('/announcements', announcementsRouter);

// Validation routes
router.use('/validation', validationRouter);

export default router;