// Users Routes

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { getMe, updateMe, getUserStats } from './users.controller';

const router = Router();

router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.get('/me/stats', requireAuth, getUserStats);

export default router;

