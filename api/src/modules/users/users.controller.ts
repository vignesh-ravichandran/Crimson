// Users Controller
// Based on design/api-specification.md

import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        settings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    return res.json({
      data: user,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user' }
    });
  }
}

export async function updateMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
    }

    const { displayName, preferences } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        displayName: displayName !== undefined ? displayName : undefined,
        settings: preferences !== undefined ? preferences : undefined
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        settings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.json({
      data: updatedUser,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update user' }
    });
  }
}

export async function getUserStats(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
    }

    // Get total journeys user is a member of
    const totalJourneys = await prisma.journeyMember.count({
      where: {
        userId: req.user.id,
        journey: { status: 'active' }
      }
    });

    // Get total check-ins
    const totalCheckins = await prisma.checkin.count({
      where: { userId: req.user.id }
    });

    // Get current highest streak across all journeys
    const streaks = await prisma.streak.findMany({
      where: { userId: req.user.id },
      orderBy: { currentStreak: 'desc' },
      take: 1
    });

    const currentStreak = streaks.length > 0 ? streaks[0].currentStreak : 0;
    const longestStreak = streaks.length > 0 ? streaks[0].longestStreak : 0;

    // Get check-ins in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCheckins = await prisma.checkin.count({
      where: {
        userId: req.user.id,
        date: { gte: sevenDaysAgo }
      }
    });

    return res.json({
      data: {
        totalJourneys,
        totalCheckins,
        currentStreak,
        longestStreak,
        recentCheckins
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user stats' }
    });
  }
}
