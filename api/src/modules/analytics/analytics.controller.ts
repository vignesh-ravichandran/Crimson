import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

/**
 * Get Radar/Spider Chart Data
 * Shows average performance across all dimensions
 */
export async function getRadarData(req: AuthRequest, res: Response) {
  try {
    const { journeyId } = req.params;
    const { startDate, endDate, userId } = req.query;

    const targetUserId = userId || req.user?.id;

    if (!targetUserId) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
    }

    // Parse dates
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Get all dimensions for this journey
    const dimensions = await prisma.dimension.findMany({
      where: { journeyId },
      orderBy: { displayOrder: 'asc' },
      include: {
        checkinDetails: {
          where: {
            checkin: {
              userId: targetUserId as string,
              date: {
                gte: start,
                lte: end
              }
            }
          },
          select: {
            score: true
          }
        }
      }
    });

    // Calculate average scores
    const radarData = dimensions.map((dim: any, index: number) => {
      const scores = dim.checkinDetails.map((cd: any) => Number(cd.score));
      const avgScore = scores.length > 0
        ? scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length
        : 0;
      const maxScore = dim.weight * 3; // Max effort level is 3

      // Generate colors from crimson palette
      const colors = ['#DC143C', '#8B0000', '#CD5C5C', '#B22222', '#A52A2A', '#800000'];
      
      return {
        dimension: dim.name,
        dimensionId: dim.id,
        avgScore: Math.round(avgScore * 10) / 10,
        maxScore,
        checkinCount: scores.length,
        color: colors[index % colors.length]
      };
    });

    logger.info('Radar data generated', {
      journeyId,
      userId: targetUserId,
      dimensionCount: radarData.length,
      period: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`
    });

    return res.json({
      data: {
        dimensions: radarData,
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        }
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error: any) {
    logger.error('Get radar data error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch radar data' }
    });
  }
}

/**
 * Get Line Chart Data
 * Shows total score trend over time
 */
export async function getLineChartData(req: AuthRequest, res: Response) {
  try {
    const { journeyId } = req.params;
    const { startDate, endDate, userId } = req.query;

    const targetUserId = userId || req.user?.id;

    if (!targetUserId) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Get daily check-ins
    const checkins = await prisma.checkin.findMany({
      where: {
        journeyId,
        userId: targetUserId as string,
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        totalScore: true
      }
    });

    const lineData = checkins.map(c => ({
      date: c.date.toISOString().split('T')[0],
      score: Number(c.totalScore),
      formattedDate: c.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    logger.info('Line chart data generated', {
      journeyId,
      userId: targetUserId,
      dataPoints: lineData.length
    });

    return res.json({
      data: {
        scores: lineData,
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        }
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error: any) {
    logger.error('Get line chart data error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch line chart data' }
    });
  }
}

/**
 * Get Stacked Bar Chart Data
 * Shows daily breakdown by dimensions
 */
export async function getStackedBarData(req: AuthRequest, res: Response) {
  try {
    const { journeyId } = req.params;
    const { startDate, endDate, userId } = req.query;

    const targetUserId = userId || req.user?.id;

    if (!targetUserId) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Get dimensions
    const dimensions = await prisma.dimension.findMany({
      where: { journeyId },
      orderBy: { displayOrder: 'asc' }
    });

    // Get check-ins with details
    const checkins = await prisma.checkin.findMany({
      where: {
        journeyId,
        userId: targetUserId as string,
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: { date: 'asc' },
      include: {
        details: {
          include: {
            dimension: true
          }
        }
      }
    });

    // Format data for stacked bar chart
    const stackedData = checkins.map((checkin: any) => {
      const dayData: any = {
        date: checkin.date.toISOString().split('T')[0],
        formattedDate: checkin.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        total: Number(checkin.totalScore)
      };

      // Add each dimension's score
      checkin.details.forEach((detail: any) => {
        dayData[detail.dimension.name] = Number(detail.score);
      });

      return dayData;
    });

    // Generate dimension colors
    const colors = ['#DC143C', '#8B0000', '#CD5C5C', '#B22222', '#A52A2A', '#800000'];
    const dimensionColors: Record<string, string> = {};
    dimensions.forEach((dim, idx) => {
      dimensionColors[dim.name] = colors[idx % colors.length];
    });

    logger.info('Stacked bar data generated', {
      journeyId,
      userId: targetUserId,
      days: stackedData.length
    });

    return res.json({
      data: {
        daily: stackedData,
        dimensions: dimensions.map(d => d.name),
        colors: dimensionColors,
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        }
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error: any) {
    logger.error('Get stacked bar data error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stacked bar data' }
    });
  }
}

/**
 * Get Calendar Heatmap Data
 * Shows check-in consistency over time
 */
export async function getHeatmapData(req: AuthRequest, res: Response) {
  try {
    const { journeyId } = req.params;
    const { startDate, endDate, userId } = req.query;

    const targetUserId = userId || req.user?.id;

    if (!targetUserId) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
    }

    // Default to last 90 days for heatmap
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Get all check-ins
    const checkins = await prisma.checkin.findMany({
      where: {
        journeyId,
        userId: targetUserId as string,
        date: {
          gte: start,
          lte: end
        }
      },
      select: {
        date: true,
        totalScore: true
      }
    });

    // Format for heatmap
    const heatmapData = checkins.map(c => ({
      date: c.date.toISOString().split('T')[0],
      score: Number(c.totalScore),
      level: Math.min(4, Math.floor(Number(c.totalScore) / 5)) // 0-4 levels for color intensity
    }));

    logger.info('Heatmap data generated', {
      journeyId,
      userId: targetUserId,
      days: heatmapData.length
    });

    return res.json({
      data: {
        checkins: heatmapData,
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        },
        stats: {
          totalDays: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
          checkinDays: heatmapData.length,
          consistency: Math.round((heatmapData.length / Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) * 100)
        }
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error: any) {
    logger.error('Get heatmap data error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch heatmap data' }
    });
  }
}

