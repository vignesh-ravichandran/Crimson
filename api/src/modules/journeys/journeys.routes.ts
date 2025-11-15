// Journeys Routes

import { Router } from 'express';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware';
import {
  createJourney,
  getJourneys,
  getJourneyById,
  joinJourney,
  sendInvite
} from './journeys.controller';

const router = Router();

// Public endpoints (optional auth)
router.get('/', optionalAuth, getJourneys);
router.get('/:journeyId', optionalAuth, getJourneyById);

// Protected endpoints
router.post('/', requireAuth, createJourney);
router.post('/:journeyId/join', requireAuth, joinJourney);
router.post('/:journeyId/invites', requireAuth, sendInvite);

// TODO: Add these endpoints
// router.put('/:journeyId', requireAuth, updateJourney);
// router.delete('/:journeyId/members/me', requireAuth, leaveJourney);

export default router;

