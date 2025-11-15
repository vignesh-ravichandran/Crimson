// Checkins Routes

import { Router } from 'express';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware';
import { createOrUpdateCheckin, getCheckins } from './checkins.controller';

const router = Router();

router.post('/', requireAuth, createOrUpdateCheckin);
router.get('/', optionalAuth, getCheckins);

export default router;

