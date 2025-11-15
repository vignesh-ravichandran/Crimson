import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import {
  getRadarData,
  getLineChartData,
  getStackedBarData,
  getHeatmapData
} from './analytics.controller';

const router = Router();

// All analytics routes require authentication
router.use(requireAuth);

// GET /api/analytics/journeys/:journeyId/radar
router.get('/journeys/:journeyId/radar', getRadarData);

// GET /api/analytics/journeys/:journeyId/line
router.get('/journeys/:journeyId/line', getLineChartData);

// GET /api/analytics/journeys/:journeyId/stacked-bar
router.get('/journeys/:journeyId/stacked-bar', getStackedBarData);

// GET /api/analytics/journeys/:journeyId/heatmap
router.get('/journeys/:journeyId/heatmap', getHeatmapData);

export default router;

