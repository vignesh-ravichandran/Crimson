// Checkins Controller
// Based on design/api-specification.md Section 3

import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { Prisma } from '@prisma/client';

// Effort level to score mapping (from design/database-schema.md)
const EFFORT_SCORE_MAP: Record<number, number> = {
  1: -1.0,  // Skipped
  2: 0.5,   // Minimal Effort
  3: 1.0,   // Partial Effort
  4: 2.0,   // Solid Effort
  5: 3.0    // Crushed It
};

export async function createOrUpdateCheckin(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
    }

    const { journeyId, date, clientCheckinId, details } = req.body;

    // Validation
    if (!journeyId || !date || !details || !Array.isArray(details)) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'journeyId, date, and details are required' }
      });
    }

    // Parse date
    const checkinDate = new Date(date);
    if (isNaN(checkinDate.getTime())) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid date format' }
      });
    }

    // Check if date is within last 7 days (inclusive of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Allow dates from 7 days ago up to today (not future dates)
    if (checkinDate >= tomorrow || checkinDate < sevenDaysAgo) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Check-in date must be within last 7 days' }
      });
    }

    // Validate details
    for (const detail of details) {
      if (!detail.dimensionId || !detail.effortLevel) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Each detail must have dimensionId and effortLevel' }
        });
      }
      if (detail.effortLevel < 1 || detail.effortLevel > 5) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'effortLevel must be between 1 and 5' }
        });
      }
    }

    // Check if user is a member of the journey
    const membership = await prisma.journeyMember.findUnique({
      where: {
        journeyId_userId: {
          journeyId,
          userId: req.user.id
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Not a member of this journey' }
      });
    }

    // Get dimensions with weights
    const dimensions = await prisma.dimension.findMany({
      where: {
        journeyId,
        id: { in: details.map((d: any) => d.dimensionId) }
      }
    });

    if (dimensions.length !== details.length) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Some dimensions not found in journey' }
      });
    }

    // Calculate scores
    const detailsWithScores = details.map((detail: any) => {
      const dimension = dimensions.find(d => d.id === detail.dimensionId);
      if (!dimension) throw new Error('Dimension not found');
      
      const effortScore = EFFORT_SCORE_MAP[detail.effortLevel];
      const score = dimension.weight * effortScore;
      
      return {
        dimensionId: detail.dimensionId,
        effortLevel: detail.effortLevel,
        score
      };
    });

    const totalScore = detailsWithScores.reduce((sum, d) => sum + d.score, 0);

    // Check for idempotency (if clientCheckinId provided)
    if (clientCheckinId) {
      const existing = await prisma.checkin.findUnique({
        where: { clientCheckinId },
        include: { details: true }
      });

      if (existing) {
        logger.info(`Idempotent check-in request: ${clientCheckinId}`);
        return res.json({
          data: existing,
          meta: { timestamp: new Date().toISOString() }
        });
      }
    }

    // Upsert checkin
    const checkin = await prisma.checkin.upsert({
      where: {
        userId_journeyId_date: {
          userId: req.user.id,
          journeyId,
          date: checkinDate
        }
      },
      update: {
        totalScore,
        clientCheckinId: clientCheckinId || undefined,
        details: {
          deleteMany: {}, // Remove old details
          create: detailsWithScores
        }
      },
      create: {
        userId: req.user.id,
        journeyId,
        date: checkinDate,
        totalScore,
        clientCheckinId,
        details: {
          create: detailsWithScores
        }
      },
      include: {
        details: {
          include: {
            dimension: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Update streak
    await updateStreak(req.user.id, journeyId, checkinDate);

    // Update last checkin timestamp for member
    await prisma.journeyMember.update({
      where: {
        journeyId_userId: {
          journeyId,
          userId: req.user.id
        }
      },
      data: {
        lastCheckinAt: new Date()
      }
    });

    // Get current streak
    const streak = await prisma.streak.findUnique({
      where: {
        userId_journeyId: {
          userId: req.user.id,
          journeyId
        }
      }
    });

    // TODO: Check for badge eligibility
    // const badgesEarned = await checkBadgeEligibility(req.user.id, journeyId, checkin);

    logger.info(`Check-in saved: user ${req.user.id}, journey ${journeyId}, date ${date}`);

    return res.status(checkin.createdAt === checkin.updatedAt ? 201 : 200).json({
      data: {
        ...checkin,
        details: checkin.details.map(d => ({
          dimensionId: d.dimensionId,
          dimensionName: d.dimension.name,
          effortLevel: d.effortLevel,
          score: d.score
        })),
        streak: streak ? {
          current: streak.currentStreak,
          longest: streak.longestStreak
        } : null,
        badgesEarned: [] // TODO: Implement badge evaluation
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error: any) {
    logger.error('Create checkin error:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
      userId: req.user?.id,
      journeyId: req.body?.journeyId,
      date: req.body?.date
    });
    return res.status(500).json({
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to save check-in',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
}

async function updateStreak(userId: string, journeyId: string, checkinDate: Date) {
  const streak = await prisma.streak.findUnique({
    where: {
      userId_journeyId: {
        userId,
        journeyId
      }
    }
  });

  if (!streak) {
    // First check-in - create streak
    await prisma.streak.create({
      data: {
        userId,
        journeyId,
        currentStreak: 1,
        longestStreak: 1,
        lastCheckinDate: checkinDate
      }
    });
    return;
  }

  // Calculate day difference
  const lastDate = new Date(streak.lastCheckinDate!);
  lastDate.setHours(0, 0, 0, 0);
  const currentDate = new Date(checkinDate);
  currentDate.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // Same day update - no change to streak
    return;
  } else if (daysDiff === 1) {
    // Consecutive day - increment streak
    const newCurrent = streak.currentStreak + 1;
    const newLongest = Math.max(newCurrent, streak.longestStreak);
    
    await prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastCheckinDate: checkinDate
      }
    });

    // TODO: Check for streak badges
    logger.info(`Streak updated: user ${userId}, journey ${journeyId}, streak ${newCurrent}`);
  } else {
    // Missed days - reset current streak
    await prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentStreak: 1,
        lastCheckinDate: checkinDate
      }
    });

    logger.info(`Streak reset: user ${userId}, journey ${journeyId}`);
  }
}

export async function getCheckins(req: AuthRequest, res: Response) {
  try {
    const { journeyId, userId, startDate, endDate } = req.query;

    if (!journeyId) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'journeyId is required' }
      });
    }

    // Build where clause
    const where: any = {
      journeyId: journeyId as string
    };

    // If userId not provided, use authenticated user
    if (userId) {
      where.userId = userId as string;
    } else if (req.user) {
      where.userId = req.user.id;
    }

    // Date range filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const checkins = await prisma.checkin.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        details: {
          include: {
            dimension: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return res.json({
      data: checkins.map(c => ({
        id: c.id,
        userId: c.userId,
        journeyId: c.journeyId,
        date: c.date,
        totalScore: c.totalScore,
        details: c.details.map(d => ({
          dimensionId: d.dimensionId,
          dimensionName: d.dimension.name,
          effortLevel: d.effortLevel,
          score: d.score
        }))
      })),
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    logger.error('Get checkins error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch check-ins' }
    });
  }
}

